package tutorial;

import java.util.*;
import soot.*;
import soot.jimple.*;
import soot.options.Options;
import soot.toolkits.graph.BriefUnitGraph;

/** Deliberately small, explicit-flow, normal-CFG teaching analysis. */
public final class TaintWorklist {
    private static final String SOURCE = "<tutorial.BranchFlow: java.lang.String input()>";
    private static final String SINK = "<tutorial.BranchFlow: void sink(java.lang.String)>";
    private static final String AGAIN = "<tutorial.FlowCases: boolean again()>";

    // Read the RHS from the input state, before overwriting the LHS.
    static Set<String> transfer(Unit unit, Set<String> in) {
        Set<String> out = new TreeSet<>(in);
        if (unit instanceof IdentityStmt) {
            out.remove(((IdentityStmt) unit).getLeftOp().toString());
        } else if (unit instanceof AssignStmt) {
            AssignStmt assignment = (AssignStmt) unit;
            if (!(assignment.getLeftOp() instanceof Local)) throw unsupported(unit);
            Value rhs = assignment.getRightOp();
            boolean tainted;
            if (rhs instanceof Local) tainted = in.contains(rhs.toString());
            else if (rhs instanceof Constant) tainted = false;
            else if (rhs instanceof StaticInvokeExpr) {
                String signature = ((StaticInvokeExpr) rhs).getMethodRef().getSignature();
                if (SOURCE.equals(signature)) tainted = true;
                else if (AGAIN.equals(signature)) tainted = false;
                else throw unsupported(unit);
            } else throw unsupported(unit);
            String lhs = assignment.getLeftOp().toString();
            out.remove(lhs);
            if (tainted) out.add(lhs);
        } else if (unit instanceof InvokeStmt) {
            String signature = ((InvokeStmt) unit).getInvokeExpr().getMethodRef().getSignature();
            // A source whose return value is discarded produces no local fact.
            if (!SINK.equals(signature) && !SOURCE.equals(signature) && !AGAIN.equals(signature)) {
                throw unsupported(unit);
            }
        } else if (!(unit instanceof IfStmt || unit instanceof GotoStmt
                || unit instanceof ReturnVoidStmt || unit instanceof NopStmt)) {
            throw unsupported(unit);
        }
        return out;
    }

    private static IllegalArgumentException unsupported(Unit unit) {
        return new IllegalArgumentException("Outside tutorial model: " + unit);
    }

    static final class Result {
        final Map<Unit, Set<String>> in = new IdentityHashMap<>();
        final Map<Unit, Set<String>> out = new IdentityHashMap<>();
        int visits;
    }

    static Result solve(Body body) {
        BriefUnitGraph graph = new BriefUnitGraph(body);
        Result result = new Result();
        Deque<Unit> work = new ArrayDeque<>();
        Set<Unit> queued = Collections.newSetFromMap(new IdentityHashMap<>());
        // Only the method entry is seeded. Other graph heads can be unreachable.
        Unit entry = body.getUnits().getFirst();
        result.in.put(entry, new TreeSet<>());
        work.add(entry);
        queued.add(entry);
        while (!work.isEmpty()) {
            Unit unit = work.removeFirst();
            queued.remove(unit);
            result.visits++;
            Set<String> next = transfer(unit, result.in.get(unit));
            Set<String> previous = result.out.put(unit, next);
            if (previous != null && previous.equals(next)) continue;
            for (Unit successor : graph.getSuccsOf(unit)) {
                Set<String> oldIn = result.in.get(successor);
                Set<String> merged = oldIn == null ? new TreeSet<>() : new TreeSet<>(oldIn);
                merged.addAll(next);
                if (oldIn == null || !oldIn.equals(merged)) {
                    result.in.put(successor, merged);
                    if (queued.add(successor)) work.addLast(successor);
                }
            }
        }
        return result;
    }

    private static void require(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }

    private static void inspect(String className, String method, Set<String> expectedAtSink) {
        SootClass clazz = Scene.v().getSootClass(className);
        Body body = clazz.getMethod("void " + method + "(boolean)").retrieveActiveBody();
        body.validate();
        Result result = solve(body);
        System.out.println("=== " + className + "." + method + " ===");
        int number = 0;
        int sinks = 0;
        for (Unit unit : body.getUnits()) {
            number++;
            System.out.printf("n%d | %s | IN=%s | OUT=%s%n", number, unit,
                    result.in.get(unit), result.out.get(unit));
            if (unit instanceof InvokeStmt
                    && SINK.equals(((InvokeStmt) unit).getInvokeExpr().getMethodRef().getSignature())) {
                sinks++;
                require(expectedAtSink.equals(result.in.get(unit)), "Unexpected sink facts in " + method);
            }
        }
        require(sinks == 1, "Expected one sink");
        if (method.equals("run")) {
            List<Unit> units = new ArrayList<>();
            body.getUnits().forEach(units::add);
            require(units.size() == 7, "Baseline node numbering changed");
            String[] expectedIn = {"[]", "[]", "[x]", "[x]", "[x]", "[x, y]", "[x, y]"};
            String[] expectedOut = {"[]", "[x]", "[x]", "[x]", "[x, y]", "[x, y]", "[x, y]"};
            for (int i = 0; i < units.size(); i++) {
                require(expectedIn[i].equals(result.in.get(units.get(i)).toString()), "IN n" + (i + 1));
                require(expectedOut[i].equals(result.out.get(units.get(i)).toString()), "OUT n" + (i + 1));
            }
        }
        if (method.equals("loop")) require(result.visits > body.getUnits().size(), "Loop was not revisited");
        System.out.println("visits=" + result.visits + "; nodes=" + body.getUnits().size());
    }

    private static void checkBoundaryCases() {
        Local x = Jimple.v().newLocal("x", RefType.v("java.lang.String"));
        Set<String> tainted = new TreeSet<>(Collections.singleton("x"));
        require(transfer(Jimple.v().newAssignStmt(x, x), tainted).equals(tainted), "Self-copy lost taint");
        require(transfer(Jimple.v().newAssignStmt(x, StringConstant.v("safe")), tainted).isEmpty(),
                "Constant did not kill taint");
        SootMethod method = new SootMethod("unreachable", Collections.emptyList(), VoidType.v(), Modifier.STATIC);
        JimpleBody body = Jimple.v().newBody(method);
        method.setActiveBody(body);
        body.getLocals().add(x);
        Unit exit = Jimple.v().newReturnVoidStmt();
        Unit deadSource = Jimple.v().newAssignStmt(x, Jimple.v().newStaticInvokeExpr(
                Scene.v().getMethod(SOURCE).makeRef()));
        body.getUnits().add(Jimple.v().newGotoStmt(exit));
        body.getUnits().add(deadSource);
        body.getUnits().add(exit);
        body.validate();
        Result result = solve(body);
        require(!result.in.containsKey(deadSource), "Unreachable source was executed");
        require(result.in.containsKey(exit) && result.in.get(exit).isEmpty(), "Empty reachable state was lost");
        System.out.println("boundary checks: self-copy, overwrite, unreachable source, empty reachable state OK");
    }

    public static void main(String[] args) {
        if (args.length != 1) throw new IllegalArgumentException("Usage: TaintWorklist <classes>");
        G.reset();
        Options.v().set_prepend_classpath(true);
        Options.v().set_soot_classpath(args[0]);
        Options.v().set_src_prec(Options.src_prec_class);
        Options.v().set_output_format(Options.output_format_none);
        Options.v().setPhaseOption("jb", "use-original-names:true");
        Scene.v().loadClassAndSupport("tutorial.BranchFlow").setApplicationClass();
        Scene.v().loadClassAndSupport("tutorial.FlowCases").setApplicationClass();
        Scene.v().loadNecessaryClasses();
        inspect("tutorial.BranchFlow", "run", new TreeSet<>(Arrays.asList("x", "y")));
        inspect("tutorial.FlowCases", "safe", Collections.emptySet());
        inspect("tutorial.FlowCases", "loop", new TreeSet<>(Arrays.asList("x", "y", "z")));
        checkBoundaryCases();
        System.out.println("ALL CHECKS PASSED");
    }
}
