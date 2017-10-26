package vici.entities.Table;

import java.util.ArrayList;
import java.util.HashMap;

public class Source {
    private ArrayList<Column> columns;
    private ArrayList<HashMap<String, String>> data;

    public Source(ArrayList<Column> columns, ArrayList<HashMap<String, String>> data) {
        this.columns = columns;
        this.data = data;
    }

    public ArrayList<Column> getColumns() {
        return columns;
    }

    public void setColumns(ArrayList<Column> columns) {
        this.columns = columns;
    }

    public ArrayList<HashMap<String, String>> getData() {
        return data;
    }

    public void setData(ArrayList<HashMap<String, String>> data) {
        this.data = data;
    }
}
