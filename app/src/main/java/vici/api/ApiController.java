package vici.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vici.Fetcher;
import vici.entities.*;
import vici.entities.Cytoscape.*;
import vici.entities.Eiffel.CustomData;
import vici.entities.Eiffel.Outcome;
import vici.entities.Table.Column;
import vici.entities.Table.Source;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

import static vici.Fetcher.*;
import static vici.entities.Event.*;

@RestController
public class ApiController {

    private String getStandardAggregateValue(Event event) {
        switch (event.getType()) {
            case ACTIVITY:
                return event.getThisEiffelEvent().getData().getName();
            case "EiffelAnnouncementPublishedEvent":
                return event.getThisEiffelEvent().getData().getHeading();
            case "EiffelArtifactCreatedEvent":
//            case "EiffelArtifactPublishedEvent": TODO
            case "EiffelArtifactReusedEvent":
                if (event.getThisEiffelEvent().getData().getGav() == null) {
                    System.out.println(event.getThisEiffelEvent().getMeta().getType());
                }
//                return event.getThisEiffelEvent().getData().getGav().getGroupId() + "[" + event.getThisEiffelEvent().getData().getGav().getArtifactId() + "]";
                return event.getThisEiffelEvent().getData().getGav().getArtifactId();
            case "EiffelCompositionDefinedEvent":
            case "EiffelConfidenceLevelModifiedEvent":
            case "EiffelEnvironmentDefinedEvent":
            case TEST_SUITE:
                return event.getThisEiffelEvent().getData().getName();
            case "EiffelFlowContextDefined":
                return null;
            case "EiffelIssueVerifiedEvent":
                // TODO: -IV: data.issues (notera att detta är en array. Dvs det skulle vara snyggt om samma event kan dyka upp i flera objektrepresentationer i grafen)
                return null;
            case "EiffelSourceChangeCreatedEvent":
            case "EiffelSourceChangeSubmittedEvent":
                // TODO: möjlighet att välja identifier (git/svn/...)

                String type;
                if (event.getType().equals("EiffelSourceChangeCreatedEvent")) {
                    type = "Created";
                } else {
                    type = "Submitted";
                }
                if (event.getThisEiffelEvent().getData().getGitIdentifier() != null) {
//                    return event.getThisEiffelEvent().getData().getGitIdentifier().getRepoUri() + "[" + event.getThisEiffelEvent().getData().getGitIdentifier().getBranch() + "]";
//                    return event.getThisEiffelEvent().getData().getGitIdentifier().getRepoUri();
                    return type + "@" + event.getThisEiffelEvent().getData().getGitIdentifier().getRepoName();
                }
                return null;
            case TEST_CASE:
                return event.getThisEiffelEvent().getData().getTestCase().getId();
            case "EiffelTestExecutionRecipeCollectionCreatedEvent":
                return null;
            default:
                return null;
        }
    }

    private String getAggregateValue(Event event, HashMap<String, String> aggregateKeys) {
        if (aggregateKeys == null || !aggregateKeys.containsKey(event.getType())) {
            String value = getStandardAggregateValue(event);

            if (value == null) {
                if (event.getThisEiffelEvent().getData().getCustomData() != null) {
                    for (CustomData customData : event.getThisEiffelEvent().getData().getCustomData()) {
                        if (customData.getKey().equals("name")) {
                            return "Custom[" + customData.getValue() + "]";
                        }
                    }
                }
            }
            return value;
        }

        String aggregateKey = aggregateKeys.get(event.getType());
        String[] path = aggregateKeys.get(event.getType()).split("\\.");

        return null;
    }

    private void setQuantities(Node node, Event event) {
        switch (node.getData().getType()) {
            case TEST_CASE:
            case ACTIVITY:
            case TEST_SUITE:
                Outcome outcome = event.getEiffelEvents().get(FINISHED).getData().getOutcome();
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
                node.getData().increaseQuantity(event.getEiffelEvents().get(TRIGGERED).getData().getValue());

                break;
            default:
                node.getData().increaseQuantity();
                break;
        }
    }

    @GetMapping(value = "/api/aggregationGraph", produces = "application/json; charset=UTF-8")
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

            if (!event.getType().equals(REDIRECT)) {
                event.setAggregateOn(getAggregateValue(event, null));
                Node node;
                if (nodes.containsKey(event.getAggregateOn())) {
                    node = nodes.get(event.getAggregateOn());
                } else {
                    node = new Node(new DataNode(event.getAggregateOn(), event.getAggregateOn(), event.getType(), null, 0));
                    node.getData().getInfo().put("Type", event.getType());
                    nodes.put(event.getAggregateOn(), node);
                }

                setQuantities(node, event);
            }
        }

        // Edges
        for (String key : events.keySet()) {
            Event event = events.get(key);
            if (!event.getType().equals(REDIRECT)) {
                for (Link link : event.getLinks()) {
                    String target = events.get(getTarget(link.getTarget(), events)).getAggregateOn();
                    String edgeId = getEdgeId(event.getAggregateOn(), target, link.getType());
                    if (edges.containsKey(edgeId)) {
                        edges.get(edgeId).getData().increaseQuantity();
                    } else {
                        edges.put(edgeId, new Edge(new DataEdge(edgeId, event.getAggregateOn(), target, edgeId, link.getType())));
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

    @GetMapping(value = "/api/detailedEvents", produces = "application/json; charset=UTF-8")
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
            if (!event.getType().equals(REDIRECT)) {
                if (event.getAggregateOn().equals(name)) {
                    HashMap<String, String> row = new HashMap<>();

                    addColumn(row, columns, cSet, "id", event.getId());
                    addColumn(row, columns, cSet, "event", event.getAggregateOn());
                    addColumn(row, columns, cSet, "type", event.getType());

                    for (String keyTime : event.getTimes().keySet()) {
                        addColumn(row, columns, cSet, "time-" + keyTime, String.valueOf(event.getTimes().get(keyTime)));
                    }

                    if (event.getTimes().containsKey(STARTED) && event.getTimes().containsKey(FINISHED)) {
                        addColumn(row, columns, cSet, "time-execution", String.valueOf(event.getTimes().get(FINISHED) - event.getTimes().get(STARTED)));
                    }

                    switch (event.getType()) {
                        case TEST_CASE:
                        case ACTIVITY:
                        case TEST_SUITE:
                            Outcome outcome = event.getEiffelEvents().get(FINISHED).getData().getOutcome();
                            if (outcome.getConclusion() != null) {
                                addColumn(row, columns, cSet, "conclusion", outcome.getConclusion());
                            }
                            if (outcome.getVerdict() != null) {
                                addColumn(row, columns, cSet, "verdict", outcome.getVerdict());
                            }

                            break;
                        case "EiffelConfidenceLevelModifiedEvent":
                            addColumn(row, columns, cSet, "result", event.getEiffelEvents().get(TRIGGERED).getData().getValue());
                            addColumn(row, columns, cSet, "confidence", event.getEiffelEvents().get(TRIGGERED).getData().getName());
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
                case "event":
                    columns.add(new Column("Event", key));
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

    @GetMapping(value = "/api/eventChainGraph", produces = "application/json; charset=UTF-8")
    public Graph eventChainGraph(@RequestParam(value = "id", defaultValue = "") String id, @RequestParam(value = "steps", defaultValue = "6") String stepsString, @RequestParam(value = "maxConnections", defaultValue = "16") String maxConnectionsString, @RequestParam(value = "url", defaultValue = "http://localhost:8080/events.json") String url) {
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
        int maxConnections = Integer.parseInt(maxConnectionsString);

        Event mainEvent = events.get(id);


        HashMap<String, Event> incEvents = new HashMap<>();

        HashSet<String> bannedLinks = new HashSet<>();
        bannedLinks.add("PREVIOUS_VERSION");
//        bannedLinks.add("ENVIRONMENT");
//        bannedLinks.add("ELEMENT");

//        HashSet<String> dangerousEvents = new HashSet<>();
//        dangerousEvents.add("EiffelEnvironmentDefinedEvent");
//        dangerousEvents.add("EiffelCompositionDefinedEvent");

        step(mainEvent, incEvents, events, steps, maxConnections, bannedLinks);
//        for (String key : incEvents.keySet()) {
//            System.out.println(incEvents.get(key).getType());
//        }

        HashMap<String, Node> nodes = new HashMap<>();
        HashMap<String, Edge> edges = new HashMap<>();


        // Nodes
        for (String key : incEvents.keySet()) {
            Event event = incEvents.get(key);

            if (!event.getType().equals(REDIRECT)) {
                Node node = new Node(new DataNode(event.getId(), event.getAggregateOn(), event.getType(), null, 0));
                nodes.put(event.getId(), node);
                graph.increaseInfo("nodeTypes", node.getData().getType());
                setQuantities(node, event);
            }
        }

        // Edges
        for (String key : incEvents.keySet()) {
            Event event = incEvents.get(key);

            if (!event.getType().equals(REDIRECT) && event.getLinks().size() + event.getChildren().size() <= maxConnections) {
                for (Link link : event.getLinks()) {
                    String target = getTarget(link.getTarget(), events);
                    if (!incEvents.containsKey(target)) {
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
                    if (!incEvents.containsKey(childId)) {
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

//        for (String key : graph.getQuantities().keySet()) {
//            System.out.println(key + ":");
//            for (String valueKey : graph.getQuantities().get(key).keySet()) {
//                System.out.println(valueKey + ": " + graph.getQuantities().get(key).get(valueKey));
//            }
//        }

        return graph;
    }

    private void step(Event event, HashMap<String, Event> incEvents, HashMap<String, Event> events, int steps, int maxConnections, HashSet<String> bannedLinks) {

        incEvents.put(event.getId(), event);
        if (event.getChildren().size() + event.getLinks().size() > maxConnections) {
            return;
        }
        if (steps <= 0) {
            return;
        }

        ArrayList<Link> links = event.getLinks();
        if (links != null) {
            for (Link link : links) {
                if (!bannedLinks.contains(link.getType())) {
                    Event tmpEvent = events.get(getTarget(link.getTarget(), events));
                    int newSteps = steps - 1;
                    step(tmpEvent, incEvents, events, newSteps, maxConnections, bannedLinks);
                }
            }
        }

        ArrayList<ChildLink> children = event.getChildren();
        if (children != null) {
            for (ChildLink child : children) {
                if (!bannedLinks.contains(child.getType())) {
                    Event tmpEvent = events.get(child.getChild());
                    int newSteps = steps - 1;
                    step(tmpEvent, incEvents, events, newSteps, maxConnections, bannedLinks);
                }
            }
        }
    }

    public static String getTarget(String target, HashMap<String, Event> events) {
        if (!events.containsKey(target)) {
            return null;
        }
        Event event = events.get(target);
        if (event.getType().equals(REDIRECT)) {
            return getTarget(event.getAggregateOn(), events);
        }
        return target;
    }
}
