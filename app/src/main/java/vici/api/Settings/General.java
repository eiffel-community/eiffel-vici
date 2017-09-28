package vici.api.Settings;

public class General {
    private long cacheLifetimeMs;

    public General() {
    }

    public long getCacheLifetimeMs() {
        return cacheLifetimeMs;
    }

    public void setCacheLifetimeMs(long cacheLifetimeMs) {
        this.cacheLifetimeMs = cacheLifetimeMs;
    }
}
