package tutorial;

/** Four short programs for chapter 11: alias, separate objects, shared factory, virtual dispatch. */
public final class PointsToCases {
    static final class Holder {
        String f;
    }

    interface Reader {
        String read();
    }

    static final class FileReader implements Reader {
        public String read() {
            return "file";
        }
    }

    static final class NetReader implements Reader {
        public String read() {
            return input();
        }
    }

    // A fresh String object, so the points-to set of a field can be inspected.
    static String input() {
        return new String(System.getProperty("demo.input", "external"));
    }

    // A visible stand-in for a sensitive operation, not a real vulnerability.
    static void sink(String value) {
        System.out.println(value);
    }

    static Holder same(Holder h) {
        return h;
    }

    // b is an alias of a: the field write through a is visible through b.
    // The copy goes through same(): a direct `Holder b = a;` is folded into a by Soot's jb phase.
    static void alias() {
        Holder a = new Holder();
        Holder b = same(a);
        a.f = input();
        sink(b.f);
    }

    // Two allocation sites: no alias, so nothing flows to the sink.
    static void separate() {
        Holder a = new Holder();
        Holder b = new Holder();
        a.f = input();
        sink(b.f);
    }

    static Holder make() {
        return new Holder();
    }

    // At run time h1 and h2 are different objects, but they share one allocation site.
    static void factory() {
        Holder h1 = make();
        Holder h2 = make();
        h1.f = input();
        sink(h2.f);
    }

    // Declared return type Reader; the only allocated implementation is FileReader.
    static Reader open() {
        return new FileReader();
    }

    static void dispatch() {
        Reader service = open();
        sink(service.read());
    }

    public static void main(String[] args) {
        alias();
        separate();
        factory();
        dispatch();
    }
}
