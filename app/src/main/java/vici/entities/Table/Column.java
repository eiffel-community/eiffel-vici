package vici.entities.Table;

public class Column {
    private String title;
    private String data;
    private String defaultContent;

    public Column(String title, String data) {
        this.title = title;
        this.data = data;
        defaultContent = "";
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getDefaultContent() {
        return defaultContent;
    }

    public void setDefaultContent(String defaultContent) {
        this.defaultContent = defaultContent;
    }
}
