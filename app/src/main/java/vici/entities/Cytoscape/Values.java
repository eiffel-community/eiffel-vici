package vici.entities.Cytoscape;

public class Values {
    private int success;
    private int fail;
    private int aborted;
    private int timedOut;
    private int inconclusive;

    public Values() {
        this.success = 0;
        this.fail = 0;
        this.aborted = 0;
        this.timedOut = 0;
        this.inconclusive = 0;
    }

    public Values(int success, int fail, int aborted, int timedOut, int inconclusive) {
        this.success = success;
        this.fail = fail;
        this.aborted = aborted;
        this.timedOut = timedOut;
        this.inconclusive = inconclusive;
    }

    public void success() {
        success++;
    }

    public void fail() {
        fail++;
    }

    public void aborted() {
        aborted++;
    }

    public void timedOut() {
        timedOut++;
    }

    public void inconclusive() {
        inconclusive++;
    }

    public int getSuccess() {
        return success;
    }

    public void setSuccess(int success) {
        this.success = success;
    }

    public int getFail() {
        return fail;
    }

    public void setFail(int fail) {
        this.fail = fail;
    }

    public int getAborted() {
        return aborted;
    }

    public void setAborted(int aborted) {
        this.aborted = aborted;
    }

    public int getTimedOut() {
        return timedOut;
    }

    public void setTimedOut(int timedOut) {
        this.timedOut = timedOut;
    }

    public int getInconclusive() {
        return inconclusive;
    }

    public void setInconclusive(int inconclusive) {
        this.inconclusive = inconclusive;
    }
}
