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

import java.util.ArrayList;
import java.util.HashMap;

@RestController
public class ApiController {
    @RequestMapping("/api/aggregationGraph")
    public ArrayList<Element> aggregationGraph(@RequestParam(value = "from", defaultValue = "0") String from, @RequestParam(value = "to", defaultValue = "0") String to, @RequestParam(value = "limit", defaultValue = "0") String limit, @RequestParam(value = "url", defaultValue = "") String url) {
        if (url.equals("")) {
            url = "http://localhost:8080/api/dummy/eiffelevents";
        }


        Fetcher fetcher = new Fetcher();
        Events eventsObject = fetcher.getEvents(url, Long.parseLong(from), Long.parseLong(to), Integer.parseInt(limit));
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


                if (node.getData().getType().equals("TestCase") || node.getData().getType().equals("Activity") || node.getData().getType().equals("TestSuit")) {
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


                } else if (node.getData().getType().equals("EiffelConfidenceLevelModifiedEvent")) {
                    String value = new JSONObject(event.getData().get("triggered")).getString("value");
                    node.getData().increaseQuantity(value);

                } else {
                    node.getData().increaseQuantity();

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
}
