package com.ericsson.vici.entities.Cytoscape;

public class Rates {
    private int success;
    private int fail;
    private int unknown;

    public Rates(int success, int fail, int unknown) {
        this.success = success;
        this.fail = fail;
        this.unknown = unknown;
    }

    public Rates() {
        this.success = 0;
        this.fail = 0;
        this.unknown = 0;
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

    public int getUnknown() {
        return unknown;
    }

    public void setUnknown(int unknown) {
        this.unknown = unknown;
    }
}
