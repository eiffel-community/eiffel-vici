package vici.api;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vici.Fetcher;
import vici.entities.Cytoscape.Edge;
import vici.entities.Cytoscape.Element;
import vici.entities.Cytoscape.Info;
import vici.entities.Cytoscape.Node;
import vici.entities.Event;
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
        HashMap<String, Event> events = fetcher.getEvents(url, Long.parseLong(from), Long.parseLong(to), Integer.parseInt(limit));

        ArrayList<Element> elements = new ArrayList<>();

        HashMap<String, Node> nodes = new HashMap<>();
        HashMap<String, Edge> edges = new HashMap<>();

        for (String key : events.keySet()) {
            Event event = events.get(key);

            if (nodes.containsKey(event.getName())) {
                nodes.get(event.getName()).getInfo().increaseQuantity();
            } else {
                nodes.put(event.getName(), new Node(event.getName(), new Info(event.getName(), event.getType())));
            }

            for (Link link : event.getLinks()) {
                if (edges.containsKey(getEdgeId(event.getName(), events.get(link.getTarget()).getName()))) {
                    edges.get(getEdgeId(event.getName(), events.get(link.getTarget()).getName())).getInfo().increaseQuantity();
                } else {
                    edges.put(getEdgeId(event.getName(), events.get(link.getTarget()).getName()), new Edge(getEdgeId(event.getName(), events.get(link.getTarget()).getName()), event.getName(), events.get(link.getTarget()).getName(),
                            new Info(getEdgeId(event.getName(), events.get(link.getTarget()).getName()), link.getType())));
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
