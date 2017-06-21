package vici.entities;

public class Time {
    private long start;
    private long finish;
    private long execution;

    public Time(long start, long finish) {
        this.start = start;
        this.finish = finish;
        this.execution = finish - start;
    }

    public Time(long start) {
        this.start = start;
        this.finish = start;
        this.execution = finish - start;
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

    public long getExecution() {
        return execution;
    }

    public void setExecution(long execution) {
        this.execution = execution;
    }
}
