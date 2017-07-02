package vici.api;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vici.Fetcher;
import vici.entities.Cytoscape.*;
import vici.entities.Eiffel.Outcome;
import vici.entities.Event;
import vici.entities.Events;
import vici.entities.Link;
import vici.entities.Table.Column;
import vici.entities.Table.Source;
import vici.entities.UrlProperty;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

@RestController
public class ApiController {
    @RequestMapping("/api/aggregationGraph")
    public ArrayList<Element> aggregationGraph(@RequestParam(value = "url", defaultValue = "http://localhost:8080/events.json") String url) {

        Fetcher fetcher = new Fetcher();
        Events eventsObject = fetcher.getEvents(url);
        HashMap<String, Event> events = eventsObject.getEvents();

        ArrayList<Element> elements = new ArrayList<>();

        HashMap<String, Node> nodes = new HashMap<>();
        HashMap<String, Edge> edges = new HashMap<>();


        // Nodes
        for (String key : events.keySet()) {
            Event event = events.get(key);

            if (!event.getType().equals("REDIRECT")) {
                Node node;

                if (nodes.containsKey(event.getName())) {
//                    nodes.get(event.getName()).getData().increaseQuantity();

                    node = nodes.get(event.getName());
                } else {
                    node = new Node(new DataNode(event.getName(), event.getName(), event.getType(), null));
                    nodes.put(event.getName(), node);
                }


                switch (node.getData().getType()) {
                    case "TestCase":
                    case "Activity":
                    case "TestSuite":
//                        JSONObject jsonObject = new JSONObject(event.getData().get("finished"));
//                        JSONObject outcome = jsonObject.getJSONObject("outcome");
//                        if (outcome.has("conclusion")) {
//                            node.getData().increaseQuantity(outcome.getString("conclusion"));
//                        } else if (outcome.has("verdict")) {
//                            String verdict = outcome.getString("verdict");
//                            if (verdict.equals("PASSED")) {
//                                node.getData().increaseQuantity("SUCCESSFUL");
//                            } else {
//                                node.getData().increaseQuantity(verdict);
//                            }
//                        } else {
//                            node.getData().increaseQuantity("INCONCLUSIVE");
//                            System.out.println(jsonObject.toString());
//                        }

                        Outcome outcome = event.getData().get("finished").getOutcome();
                        if (outcome.getConclusion() != null) {
                            node.getData().increaseQuantity(outcome.getConclusion());
                        } else if (outcome.getVerdict() != null) {
                            if (outcome.getVerdict().equals("PASSED")) {
                                node.getData().increaseQuantity("SUCCESSFUL");
                            } else {
                                node.getData().increaseQuantity(outcome.getVerdict());
                            }
                        } else {
                            node.getData().increaseQuantity("INCONCLUSIVE");
                        }


                        break;
                    case "EiffelConfidenceLevelModifiedEvent":
//                        String value = new JSONObject(event.getData().get("triggered")).getString("value");
//                        node.getData().increaseQuantity(value);
//
                        node.getData().increaseQuantity(event.getData().get("triggered").getValue());

                        break;
                    default:
                        node.getData().increaseQuantity();

                        break;
                }
            }
        }

        // Edges
        for (String key : events.keySet()) {
            Event event = events.get(key);
            if (!event.getType().equals("REDIRECT")) {
                for (Link link : event.getLinks()) {
                    String target;
                    if (events.get(link.getTarget()).getType().equals("REDIRECT")) {
                        target = nodes.get(events.get(events.get(link.getTarget()).getName()).getName()).getData().getId();
                    } else {
                        target = nodes.get(events.get(link.getTarget()).getName()).getData().getId();
                    }
                    if (target == null) {
                        System.out.println("null");
                    }
                    if (edges.containsKey(getEdgeId(event.getName(), target))) {
                        edges.get(getEdgeId(event.getName(), target)).getData().increaseQuantity();
                    } else {
                        edges.put(getEdgeId(event.getName(), target), new Edge(new DataEdge(getEdgeId(event.getName(), target), event.getName(), target, getEdgeId(event.getName(), target), link.getType())));
                    }
                }
            }
        }

        for (String key : nodes.keySet()) {
            elements.add(nodes.get(key));
        }

        for (String key : edges.keySet()) {
            elements.add(edges.get(key));
        }

        return elements;
    }

    private String getEdgeId(String source, String target) {
        return source + "-" + target;
    }

    @RequestMapping("/api/detailedEvents")
    public Source detailedEvents(@RequestParam(value = "name", defaultValue = "") String name, @RequestParam(value = "url", defaultValue = "http://localhost:8080/events.json") String url) {

        ArrayList<UrlProperty> urlProperties = new ArrayList<>();
//        if (!name.equals("")) {
//            urlProperties.add(new UrlProperty("name", name));
//        }

        Fetcher fetcher = new Fetcher();
        Events eventsObject = fetcher.getEvents(url, urlProperties);
        HashMap<String, Event> events = eventsObject.getEvents();

        ArrayList<HashMap<String, String>> data = new ArrayList<>();
        ArrayList<Column> columns = new ArrayList<>();

        HashSet<String> cSet = new HashSet<>();

        for (String key : events.keySet()) {
            Event event = events.get(key);
            if (!event.getType().equals("REDIRECT")) {
                if (event.getName().equals(name)) {
                    HashMap<String, String> row = new HashMap<>();

                    addColumn(row, columns, cSet, "id", event.getId());
                    addColumn(row, columns, cSet, "name", event.getName());
                    addColumn(row, columns, cSet, "type", event.getType());

                    for (String keyTime : event.getTimes().keySet()) {
                        addColumn(row, columns, cSet, "time-" + keyTime, String.valueOf(event.getTimes().get(keyTime)));
                    }

                    if (event.getTimes().containsKey("started") && event.getTimes().containsKey("finished")) {
                        addColumn(row, columns, cSet, "time-execution", String.valueOf(event.getTimes().get("finished") - event.getTimes().get("started")));
                    }

                    switch (event.getType()) {
                        case "TestCase":
                        case "Activity":
                        case "TestSuite":
                            Outcome outcome = event.getData().get("finished").getOutcome();
                            if (outcome.getConclusion() != null) {
                                addColumn(row, columns, cSet, "conclusion", outcome.getConclusion());
                            }
                            if (outcome.getVerdict() != null) {
                                addColumn(row, columns, cSet, "verdict", outcome.getVerdict());
                            }

                            break;
                        case "EiffelConfidenceLevelModifiedEvent":
                            addColumn(row, columns, cSet, "result", event.getData().get("triggered").getValue());
                            addColumn(row, columns, cSet, "confidence", event.getData().get("triggered").getName());
                            break;
                        default:
                            break;
                    }

                    data.add(row);
                }
            }
        }

        return new Source(columns, data);
    }

    private void addColumn(HashMap<String, String> row, ArrayList<Column> columns, HashSet<String> set, String key, String value) {
        row.put(key, value);
        if (!set.contains(key)) {
            switch (key) {
                case "name":
                    columns.add(new Column("Name", key));
                    break;
                case "id":
                    columns.add(new Column("Eiffel ID", key));
                    break;
                case "type":
                    columns.add(new Column("Type", key));
                    break;
                case "time-triggered":
//                    columns.add(new Column("Time triggered", key));
                    break;
                case "time-canceled":
//                    columns.add(new Column("Time triggered", key));
                    break;
                case "time-started":
//                    columns.add(new Column("Time started", key));
                    break;
                case "time-finished":
//                    columns.add(new Column("Time finished", key));
                    break;
                case "time-execution":
                    columns.add(new Column("Execution (ms)", key));
                    break;
                case "conclusion":
                    columns.add(new Column("Conclusion", key));
                    break;
                case "verdict":
                    columns.add(new Column("Verdict", key));
                    break;
                case "result":
                    columns.add(new Column("Result", key));
                    break;
                case "confidence":
                    columns.add(new Column("Confidence", key));
                    break;
                default:
                    columns.add(new Column(key, key));
                    break;
            }
            set.add(key);
        }
    }
}
