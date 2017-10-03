package vici.api.entities;

public class ReturnData {
    private Object data;
    private long timeCollected;

    public ReturnData() {
    }

    public ReturnData(Object data) {
        this.data = data;
        this.timeCollected = System.currentTimeMillis();
    }

    public ReturnData(Object data, long timeCollected) {
        this.data = data;
        this.timeCollected = timeCollected;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public long getTimeCollected() {
        return timeCollected;
    }

    public void setTimeCollected(long timeCollected) {
        this.timeCollected = timeCollected;
    }
}
