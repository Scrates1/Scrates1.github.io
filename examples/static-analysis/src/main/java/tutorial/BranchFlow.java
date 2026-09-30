package tutorial;

public final class BranchFlow {
    public static void run(boolean flag) {
        String x = input();
        String y = "safe";
        if (flag) {
            y = x;
        }
        sink(y);
    }

    // The tutorial models this method's result as untrusted input.
    public static String input() {
        return System.getProperty("demo.input", "external");
    }

    // A visible stand-in for a sensitive operation, not a real vulnerability.
    public static void sink(String value) {
        System.out.println(value);
    }

    public static void main(String[] args) {
        run(true);
        run(false);
    }
}
