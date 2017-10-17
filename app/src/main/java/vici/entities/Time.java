package vici.entities;

public class Time {
    private long start;
    private long finish;

    public Time(long start, long finish) {
        this.start = start;
        this.finish = finish;
    }

    public Time(long start) {
        this.start = start;
        this.finish = start;
    }

    public Time() {
        start = Long.MAX_VALUE;
        finish = Long.MIN_VALUE;
    }

    public long getStart() {
        return start;
    }

    public void setStart(long start) {
        this.start = start;
    }

    public long getFinish() {
        return finish;
    }

    public void setFinish(long finish) {
        this.finish = finish;
    }
}
