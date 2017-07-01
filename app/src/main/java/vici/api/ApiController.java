package vici.api;

import org.json.JSONObject;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vici.Fetcher;
import vici.entities.Cytoscape.*;
import vici.entities.Event;
import vici.entities.Events;
import vici.entities.Link;
import vici.entities.Table.Column;
import vici.entities.Table.Source;
import vici.entities.UrlProperty;

import java.util.ArrayList;
import java.util.HashMap;

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
                        JSONObject jsonObject = new JSONObject(event.getData().get("finished"));
                        JSONObject outcome = jsonObject.getJSONObject("outcome");
                        if (outcome.has("conclusion")) {
                            node.getData().increaseQuantity(outcome.getString("conclusion"));
                        } else if (outcome.has("verdict")) {
                            String verdict = outcome.getString("verdict");
                            if (verdict.equals("PASSED")) {
                                node.getData().increaseQuantity("SUCCESSFUL");
                            } else {
                                node.getData().increaseQuantity(verdict);
                            }
                        } else {
                            node.getData().increaseQuantity("INCONCLUSIVE");
                            System.out.println(jsonObject.toString());
                        }


                        break;
                    case "EiffelConfidenceLevelModifiedEvent":
                        String value = new JSONObject(event.getData().get("triggered")).getString("value");
                        node.getData().increaseQuantity(value);

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

        HashMap<String, String> columnNames = new HashMap<>();

        ArrayList<HashMap<String, String>> data = new ArrayList<>();
        ArrayList<Column> columns = new ArrayList<>();


        columns.add(new Column("Name", "name"));
        columns.add(new Column("ID", "id"));
        columns.add(new Column("Type", "type"));

        for (String key : events.keySet()) {
            Event event = events.get(key);
            if (!event.getType().equals("REDIRECT")) {
                if (event.getName().equals(name)) {
                    HashMap<String, String> row = new HashMap<>();

                    row.put("id", event.getId());
                    row.put("name", event.getName());
                    row.put("type", event.getType());

                    for (String keyTime : event.getTimes().keySet()) {
                        row.put(("time-" + keyTime), String.valueOf(event.getTimes().get(key)));
                    }


                    switch (event.getType()) {
                        case "TestCase":
                        case "Activity":
                        case "TestSuite":
                            System.out.println(event.getData().toString());
                            JSONObject jsonObject = new JSONObject(event.getData().get("finished"));
                            JSONObject outcome = jsonObject.getJSONObject("outcome");
                            if (outcome.has("conclusion")) {
                                row.put("conclusion", outcome.getString("conclusion"));
                            }
                            if (outcome.has("verdict")) {
                                row.put("verdict", outcome.getString("verdict"));
                            }
                            break;
                        case "EiffelConfidenceLevelModifiedEvent":
                            row.put("result", new JSONObject(event.getData().get("triggered")).getString("value"));
                            row.put("confidence", new JSONObject(event.getData().get("triggered")).getString("name"));
                            break;
                        default:
                            break;
                    }

                    data.add(row);
                }
            }
        }

        return new Source(null, data);
    }
}
