package tutorial;

import java.util.ArrayList;
import java.util.Collections;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import soot.Body;
import soot.G;
import soot.Scene;
import soot.SootClass;
import soot.Unit;
import soot.options.Options;
import soot.toolkits.graph.Block;
import soot.toolkits.graph.BriefBlockGraph;
import soot.toolkits.graph.BriefUnitGraph;

/** Print the actual method body and its normal-control-flow graphs. */
public final class InspectGraph {
    public static void main(String[] args) {
        if (args.length != 1) {
            throw new IllegalArgumentException("Usage: InspectGraph <compiled-classes-directory>");
        }
        G.reset();
        Options.v().set_prepend_classpath(true);
        Options.v().set_soot_classpath(args[0]);
        Options.v().set_src_prec(Options.src_prec_class);
        Options.v().set_output_format(Options.output_format_none);
        Options.v().set_keep_line_number(true);
        Options.v().setPhaseOption("jb", "use-original-names:true");
        SootClass target = Scene.v().loadClassAndSupport("tutorial.BranchFlow");
        target.setApplicationClass();
        Scene.v().loadNecessaryClasses();
        Body body = target.getMethod("void run(boolean)").retrieveActiveBody();
        body.validate();
        System.out.println("=== JIMPLE ===");
        System.out.println(body);

        List<Unit> units = new ArrayList<>();
        body.getUnits().forEach(units::add);
        Map<Unit, Integer> ids = new IdentityHashMap<>();
        for (int i = 0; i < units.size(); i++) {
            ids.put(units.get(i), i + 1);
        }
        BriefUnitGraph graph = new BriefUnitGraph(body);
        System.out.println("=== NORMAL CFG ===");
        for (Unit unit : units) {
            List<Integer> next = graph.getSuccsOf(unit).stream().map(ids::get).sorted().collect(Collectors.toList());
            System.out.printf("n%d | %s | successors=%s%n", ids.get(unit), unit, next);
        }
        System.out.println("=== BASIC BLOCKS ===");
        BriefBlockGraph blocks = new BriefBlockGraph(body);
        for (Block block : blocks) {
            List<Integer> contents = new ArrayList<>();
            block.forEach(unit -> contents.add(ids.get(unit)));
            List<Integer> next = block.getSuccs().stream().map(b -> b.getIndexInMethod() + 1).collect(Collectors.toList());
            Collections.sort(next);
            System.out.printf("B%d | nodes=%s | successors=%s%n", block.getIndexInMethod() + 1, contents, next);
        }
    }
}
