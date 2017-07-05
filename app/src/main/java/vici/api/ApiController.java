package vici.api;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vici.Fetcher;
import vici.entities.*;
import vici.entities.Cytoscape.*;
import vici.entities.Eiffel.Outcome;
import vici.entities.Table.Column;
import vici.entities.Table.Source;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

@RestController
public class ApiController {
    private void setQuantities(Node node, Event event) {
        switch (node.getData().getType()) {
            case "TestCase":
            case "Activity":
            case "TestSuite":
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
                node.getData().increaseQuantity(event.getData().get("triggered").getValue());

                break;
            default:
                node.getData().increaseQuantity();
                break;
        }
    }

    @RequestMapping(value = "/api/aggregationGraph", produces = "application/json; charset=UTF-8")
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
//                    nodes.get(event.getName()).getQuantities().increaseQuantity();

                    node = nodes.get(event.getName());
                } else {
                    node = new Node(new DataNode(event.getName(), event.getName(), event.getType(), null, 0));
                    nodes.put(event.getName(), node);
                }


                setQuantities(node, event);
            }
        }

        // Edges
        for (String key : events.keySet()) {
            Event event = events.get(key);
            if (!event.getType().equals("REDIRECT")) {
                for (Link link : event.getLinks()) {
                    String target = events.get(getTarget(link.getTarget(), events)).getName();
                    String edgeId = getEdgeId(event.getName(), target, link.getType());
                    if (edges.containsKey(edgeId)) {
                        edges.get(edgeId).getData().increaseQuantity();
                    } else {
                        edges.put(edgeId, new Edge(new DataEdge(edgeId, event.getName(), target, edgeId, link.getType())));
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

    private String getEdgeId(String source, String target, String type) {
        return source + "-" + type + "-" + target;
    }

    @RequestMapping(value = "/api/detailedEvents", produces = "application/json; charset=UTF-8")
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
                    columns.add(new Column("Time triggered", key));
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

    @RequestMapping(value = "/api/eventChainGraph", produces = "application/json; charset=UTF-8")
    public Graph eventChainGraph(@RequestParam(value = "url", defaultValue = "http://localhost:8080/events.json") String url, @RequestParam(value = "id", defaultValue = "") String id, @RequestParam(value = "steps", defaultValue = "8") String stepsString) {
//        ArrayList<Element> elements = new ArrayList<>();
//        HashMap<String, HashMap<String, Integer>> info = new HashMap<>();
        Graph graph = new Graph();
        if (id.equals("")) {
            return graph;
        }

        Fetcher fetcher = new Fetcher();
        Events eventsObject = fetcher.getEvents(url);
        HashMap<String, Event> events = eventsObject.getEvents();

        if (!events.containsKey(id)) {
            return graph;
        }

        int steps = Integer.parseInt(stepsString);

        Event mainEvent = events.get(id);


        HashMap<String, Event> incEvents = new HashMap<>();

        HashSet<String> bannedLinks = new HashSet<>();
        bannedLinks.add("PREVIOUS_VERSION");
//        bannedLinks.add("ENVIRONMENT");
//        bannedLinks.add("ELEMENT");

        HashSet<String> dangerousEvents = new HashSet<>();
        dangerousEvents.add("EiffelEnvironmentDefinedEvent");
        dangerousEvents.add("EiffelCompositionDefinedEvent");

        step(mainEvent, incEvents, events, steps, bannedLinks, dangerousEvents);
//        for (String key : incEvents.keySet()) {
//            System.out.println(incEvents.get(key).getType());
//        }

        HashMap<String, Node> nodes = new HashMap<>();
        HashMap<String, Edge> edges = new HashMap<>();


        // Nodes
        for (String key : incEvents.keySet()) {
            Event event = incEvents.get(key);

            if (!event.getType().equals("REDIRECT")) {
                Node node = new Node(new DataNode(event.getId(), event.getName(), event.getType(), null, 0));
                nodes.put(event.getId(), node);
                graph.increaseInfo("nodeTypes", node.getData().getType());
                setQuantities(node, event);
            }
        }

        // Edges
        for (String key : incEvents.keySet()) {
            Event event = incEvents.get(key);

            if (!event.getType().equals("REDIRECT")) {
                for (Link link : event.getLinks()) {
                    String target = getTarget(link.getTarget(), events);
                    if (!incEvents.containsKey(target) && !dangerousEvents.contains(event.getType())) {
                        nodes.put(target, new Node(new DataNode(target, "unknown", "unknown", null, 1)));
                        graph.increaseInfo("nodeTypes", "unknown");

                    }

                    if (nodes.containsKey(target)) {
                        String edgeId = getEdgeId(event.getId(), target, link.getType());
                        if (!edges.containsKey(edgeId)) {
                            edges.put(edgeId, new Edge(new DataEdge(edgeId, event.getId(), target, edgeId, link.getType())));
                            graph.increaseInfo("edgeTypes", link.getType());
                        }
                    }

                }
                for (ChildLink child : event.getChildren()) {
                    String childId = child.getChild();
                    if (!incEvents.containsKey(childId) && !dangerousEvents.contains(event.getType())) {
                        nodes.put(childId, new Node(new DataNode(childId, "unknown", "unknown", null, 1)));
                        graph.increaseInfo("nodeTypes", "unknown");
                    }

                    if (nodes.containsKey(childId)) {
                        String edgeId = getEdgeId(childId, event.getId(), child.getType());
                        if (!edges.containsKey(edgeId)) {
                            edges.put(edgeId, new Edge(new DataEdge(edgeId, childId, event.getId(), edgeId, child.getType())));
                            graph.increaseInfo("edgeTypes", child.getType());
                        }
                    }
                }
            }
        }

        for (String key : nodes.keySet()) {
            graph.getElements().add(nodes.get(key));
        }

        for (String key : edges.keySet()) {
            graph.getElements().add(edges.get(key));
        }

        for (String key : graph.getQuantities().keySet()) {
            System.out.println(key + ":");
            for (String valueKey : graph.getQuantities().get(key).keySet()) {
                System.out.println(valueKey + ": " + graph.getQuantities().get(key).get(valueKey));
            }
        }

        return graph;
        // TODO: dynamic links.length steps block
    }

    private void step(Event event, HashMap<String, Event> incEvents, HashMap<String, Event> events, int steps, HashSet<String> bannedLinks, HashSet<String> dangerousEvents) {
        incEvents.put(event.getId(), event);
        if (steps <= 0) {
            return;
        }

        ArrayList<Link> links = event.getLinks();
        if (links != null) {
            for (Link link : links) {
                if (!bannedLinks.contains(link.getType())) {
                    Event tmpEvent = events.get(getTarget(link.getTarget(), events));
                    int newSteps = steps - 1;
                    if (dangerousEvents.contains(tmpEvent.getType())) {
                        newSteps = 0;
                    }
                    step(tmpEvent, incEvents, events, newSteps, bannedLinks, dangerousEvents);
                }
            }
        }

        ArrayList<ChildLink> children = event.getChildren();
        if (children != null) {
            for (ChildLink child : children) {
                if (!bannedLinks.contains(child.getType())) {
                    Event tmpEvent = events.get(child.getChild());
                    int newSteps = steps - 1;
                    if (dangerousEvents.contains(tmpEvent.getType())) {
                        newSteps = 0;
                    }
                    step(tmpEvent, incEvents, events, newSteps, bannedLinks, dangerousEvents);
                }
            }
        }
    }

    public static String getTarget(String target, HashMap<String, Event> events) {
        if (!events.containsKey(target)) {
            return null;
        }
        Event event = events.get(target);
        if (event.getType().equals("REDIRECT")) {
            return getTarget(event.getName(), events);
        }
        return target;
    }
}
