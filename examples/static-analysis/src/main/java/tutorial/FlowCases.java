package tutorial;

public final class FlowCases {
    public static void safe(boolean flag) {
        String x = BranchFlow.input();
        String y = "safe";
        if (flag) y = "clean";
        BranchFlow.sink(y);
    }

    public static void loop(boolean flag) {
        String x = BranchFlow.input();
        String y = "safe";
        String z = "safe";
        while (flag) {
            z = y;
            y = x;
            flag = again();
        }
        BranchFlow.sink(z);
    }

    public static boolean again() {
        return Boolean.getBoolean("demo.again");
    }
}
