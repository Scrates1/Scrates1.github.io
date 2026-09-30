package tutorial;

import java.util.*;
import java.util.stream.Collectors;
import soot.*;
import soot.jimple.AnyNewExpr;
import soot.jimple.AssignStmt;
import soot.jimple.Stmt;
import soot.jimple.spark.pag.AllocNode;
import soot.jimple.spark.sets.P2SetVisitor;
import soot.jimple.spark.sets.PointsToSetInternal;
import soot.jimple.toolkits.callgraph.CallGraph;
import soot.jimple.toolkits.callgraph.Edge;
import soot.options.Options;

/** Run Soot's Spark on PointsToCases and print points-to sets, field contents and call edges. */
public final class PointsToInspect {
    private static final String TARGET = "tutorial.PointsToCases";
    private static final String HOLDER = TARGET + "$Holder";

    public static void main(String[] args) {
        if (args.length != 1) {
            throw new IllegalArgumentException("Usage: PointsToInspect <compiled-classes-directory>");
        }
        G.reset();
        Options.v().set_whole_program(true);
        Options.v().set_prepend_classpath(true);
        Options.v().set_soot_classpath(args[0]);
        Options.v().set_src_prec(Options.src_prec_class);
        Options.v().set_output_format(Options.output_format_none);
        Options.v().set_keep_line_number(true);
        // Library classes stay body-less: their allocations and calls are outside the tutorial model.
        Options.v().set_allow_phantom_refs(true);
        Options.v().set_no_bodies_for_excluded(true);
        Options.v().set_exclude(Arrays.asList("java.", "javax.", "jdk.", "sun.", "com.sun."));
        Options.v().setPhaseOption("jb", "use-original-names:true");
        Options.v().setPhaseOption("cg", "all-reachable:false");
        Options.v().setPhaseOption("cg.spark", "on");

        SootClass target = Scene.v().loadClassAndSupport(TARGET);
        target.setApplicationClass();
        for (String inner : new String[] {"Holder", "Reader", "FileReader", "NetReader"}) {
            Scene.v().loadClassAndSupport(TARGET + "$" + inner).setApplicationClass();
        }
        Scene.v().loadNecessaryClasses();
        Scene.v().setEntryPoints(Collections.singletonList(target.getMethodByName("main")));
        PackManager.v().getPack("cg").apply();

        Map<Object, String> allocLabels = labelAllocationSites();
        PointsToAnalysis pta = Scene.v().getPointsToAnalysis();
        SootField f = Scene.v().getSootClass(HOLDER).getFieldByName("f");
        Map<String, Map<String, Set<String>>> locals = new LinkedHashMap<>();
        Map<String, Map<String, Set<String>>> fields = new LinkedHashMap<>();
        System.out.println("=== JIMPLE ===");
        for (String name : new String[] {"same", "alias", "separate", "make", "factory", "open", "dispatch"}) {
            System.out.println(target.getMethodByName(name).retrieveActiveBody());
        }
        System.out.println("=== POINTS-TO SETS (Spark, context-insensitive) ===");
        for (String name : new String[] {"alias", "separate", "factory", "dispatch"}) {
            SootMethod method = target.getMethodByName(name);
            Map<String, Set<String>> localSets = new TreeMap<>();
            Map<String, Set<String>> fieldSets = new TreeMap<>();
            for (Local local : method.retrieveActiveBody().getLocals()) {
                if (local.getName().startsWith("$") || !(local.getType() instanceof RefType)) continue;
                Set<String> pts = labels(pta.reachingObjects(local), allocLabels);
                localSets.put(local.getName(), pts);
                System.out.printf("%s | pts(%s) = %s%n", name, local.getName(), pts);
                if (((RefType) local.getType()).getClassName().equals(HOLDER)) {
                    Set<String> content = labels(pta.reachingObjects(local, f), allocLabels);
                    fieldSets.put(local.getName(), content);
                    System.out.printf("%s | pts(%s.f) = %s%n", name, local.getName(), content);
                }
            }
            locals.put(name, localSets);
            fields.put(name, fieldSets);
        }

        System.out.println("=== CALL GRAPH: targets of service.read() ===");
        SootMethod dispatch = target.getMethodByName("dispatch");
        SootClass reader = Scene.v().getSootClass(TARGET + "$Reader");
        SootMethod read = reader.getMethodByName("read");
        Set<String> cha = Scene.v().getOrMakeFastHierarchy().resolveAbstractDispatch(reader, read).stream()
                .map(m -> simpleName(m.getDeclaringClass()) + ".read").collect(Collectors.toCollection(TreeSet::new));
        System.out.println("CHA on declared type Reader = " + cha);
        Set<String> spark = new TreeSet<>();
        CallGraph cg = Scene.v().getCallGraph();
        for (Iterator<Edge> it = cg.edgesOutOf(dispatch); it.hasNext(); ) {
            Edge edge = it.next();
            if (edge.tgt().getName().equals("read")) {
                spark.add(simpleName(edge.tgt().getDeclaringClass()) + ".read");
            }
        }
        System.out.println("Spark call graph edges      = " + spark);

        check(locals.get("alias").get("a").equals(locals.get("alias").get("b")), "alias: a and b share o1");
        check(fields.get("alias").get("b").size() == 1, "alias: b.f sees the String allocated in input()");
        check(Collections.disjoint(locals.get("separate").get("a"), locals.get("separate").get("b")), "separate: disjoint");
        check(fields.get("separate").get("b").isEmpty(), "separate: b.f is empty");
        check(locals.get("factory").get("h1").equals(locals.get("factory").get("h2")), "factory: one site, merged");
        check(!fields.get("factory").get("h2").isEmpty(), "factory: h2.f is spuriously tainted");
        check(cha.equals(new TreeSet<>(Arrays.asList("FileReader.read", "NetReader.read"))), "CHA has two targets");
        check(spark.equals(new TreeSet<>(Collections.singletonList("FileReader.read"))), "Spark has one target");
        System.out.println("ALL CHECKS PASSED");
    }

    /** Name every allocation site in the target class as "new T @ method:line". */
    private static Map<Object, String> labelAllocationSites() {
        Map<Object, String> labels = new IdentityHashMap<>();
        for (SootClass c : Scene.v().getApplicationClasses()) {
            for (SootMethod m : c.getMethods()) {
                if (!m.isConcrete()) continue;
                for (Unit unit : m.retrieveActiveBody().getUnits()) {
                    if (unit instanceof AssignStmt && ((AssignStmt) unit).getRightOp() instanceof AnyNewExpr) {
                        AnyNewExpr expr = (AnyNewExpr) ((AssignStmt) unit).getRightOp();
                        String type = simpleName(((RefType) expr.getType()).getSootClass());
                        labels.put(expr, "new " + type + " @ " + m.getName() + ":" + ((Stmt) unit).getJavaSourceStartLineNumber());
                    }
                }
            }
        }
        return labels;
    }

    private static Set<String> labels(PointsToSet set, Map<Object, String> allocLabels) {
        Set<String> out = new TreeSet<>();
        ((PointsToSetInternal) set).forall(new P2SetVisitor() {
            @Override
            public void visit(soot.jimple.spark.pag.Node node) {
                AllocNode alloc = (AllocNode) node;
                String label = allocLabels.get(alloc.getNewExpr());
                out.add(label != null ? label : "<library or constant: " + alloc.getNewExpr() + ">");
            }
        });
        return out;
    }

    /** "tutorial.PointsToCases$Holder" -> "Holder". */
    private static String simpleName(SootClass c) {
        String name = c.getShortName();
        return name.substring(name.lastIndexOf('$') + 1);
    }

    private static void check(boolean condition, String message) {
        if (!condition) throw new IllegalStateException("CHECK FAILED: " + message);
        System.out.println("check ok: " + message);
    }
}
