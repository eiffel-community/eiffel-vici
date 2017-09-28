package vici.api;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vici.Fetcher;
import vici.api.Settings.Settings;
import vici.entities.ChildLink;
import vici.entities.Cytoscape.*;
import vici.entities.Eiffel.CustomData;
import vici.entities.Eiffel.Outcome;
import vici.entities.Event;
import vici.entities.Events;
import vici.entities.Link;
import vici.entities.Table.Column;
import vici.entities.Table.Source;
import vici.entities.Vis.Item;
import vici.entities.Vis.Plot;

import java.util.*;

import static vici.Fetcher.*;
import static vici.entities.Event.*;

@RestController
public class ApiController {

    private static final int PLOT_GROUP_RESULT_EXEC = 0;
    private static final int PLOT_GROUP_FILL_INCONCLUSIVE = 1;
    private static final int PLOT_GROUP_FILL_PASS = 2;
    private static final int PLOT_GROUP_FILL_FAIL = 3;

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

                Outcome outcome = null;
                if (event.getEiffelEvents().containsKey(FINISHED)) {
                    outcome = event.getEiffelEvents().get(FINISHED).getData().getOutcome();
                }
                if (outcome != null && outcome.getConclusion() != null) {
                    node.getData().increaseQuantity(outcome.getConclusion());
                } else if (outcome != null && outcome.getVerdict() != null) {
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

    @RequestMapping(value = "/api/aggregationGraph", produces = "application/json; charset=UTF-8")
    public ArrayList<Element> aggregationGraph(@RequestBody Settings settings) {

//        JSONObject jsonObject = new JSONObject(settings);
//        System.out.println(jsonObject.toString());

        Fetcher fetcher = new Fetcher();
        Events eventsObject = fetcher.getEvents(settings.getSystem().getUrl(), settings.getSystem().isUseCache(), settings.getGeneral().getCacheLifetimeMs());
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

    @RequestMapping(value = "/api/detailedEvents", produces = "application/json; charset=UTF-8")
    public Source detailedEvents(@RequestBody Settings settings, @RequestParam(value = "name", defaultValue = "") String name) {

        Fetcher fetcher = new Fetcher();
        Events eventsObject = fetcher.getEvents(settings.getSystem().getUrl(), settings.getSystem().isUseCache(), settings.getGeneral().getCacheLifetimeMs());
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
                        addColumn(row, columns, cSet, "time-" + EXECUTION, String.valueOf(event.getTimes().get(FINISHED) - event.getTimes().get(STARTED)));
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
                case "time-" + TRIGGERED:
                    columns.add(new Column("Time triggered", key));
                    break;
                case "time-" + CANCELED:
                    columns.add(new Column("Time canceled", key));
                    break;
                case "time-" + STARTED:
                    columns.add(new Column("Time started", key));
                    break;
                case "time-" + FINISHED:
                    columns.add(new Column("Time finished", key));
                    break;
                case "time-" + EXECUTION:
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

    @RequestMapping(value = "/api/detailedPlot", produces = "application/json; charset=UTF-8")
    public Plot detailedPlot(@RequestBody Settings settings, @RequestParam(value = "name", defaultValue = "") String name) {

        System.out.println(name);

        Fetcher fetcher = new Fetcher();
        Events eventsObject = fetcher.getEvents(settings.getSystem().getUrl(), settings.getSystem().isUseCache(), settings.getGeneral().getCacheLifetimeMs());
        HashMap<String, Event> events = eventsObject.getEvents();

        ArrayList<Event> eventsList = new ArrayList<>();
        for (Event event : events.values()) {
            if (!event.getType().equals(REDIRECT)) {
                if (event.getAggregateOn().equals(name)) {
                    eventsList.add(event);
                }
            }
        }

        if (eventsList.isEmpty()) {
            return null;
        }

        eventsList.sort(Comparator.comparingLong(o -> o.getTimes().get(TRIGGERED)));

        ArrayList<Item> items = new ArrayList<>();

        long timeFirst = eventsList.get(0).getTimes().get(TRIGGERED);
        long timeLast = eventsList.get(eventsList.size() - 1).getTimes().get(TRIGGERED);

        int valueMin = 0;
        int valueMax = 0;

        items.add(new Item(timeFirst, 0, PLOT_GROUP_FILL_INCONCLUSIVE, null));
        items.add(new Item(timeFirst, 0, PLOT_GROUP_FILL_PASS, null));
        items.add(new Item(timeFirst, 0, PLOT_GROUP_FILL_FAIL, null));

        int lastGroup = -1; // none

        for (Event event : eventsList) {

            long x = event.getTimes().get(TRIGGERED);
            int y = 1; // for event types without an execution time
            int group = PLOT_GROUP_FILL_INCONCLUSIVE; // Inconclusive
            String label = null;

            switch (event.getType()) {
                case TEST_CASE:
                case ACTIVITY:
                case TEST_SUITE:

                    if (event.getTimes().containsKey(FINISHED)) {
                        if (event.getTimes().containsKey(STARTED)) {
                            y = (int) (event.getTimes().get(FINISHED) - event.getTimes().get(STARTED));
                        } else if (event.getTimes().containsKey(TRIGGERED)) {
                            y = (int) (event.getTimes().get(FINISHED) - event.getTimes().get(TRIGGERED));
                        }
                    }

                    Outcome outcome = event.getEiffelEvents().get(FINISHED).getData().getOutcome();
                    if (outcome.getVerdict() != null) {
                        if (outcome.getVerdict().equals("PASSED")) {
                            group = PLOT_GROUP_FILL_PASS;
                        } else if (outcome.getVerdict().equals("FAILED")) {
                            group = PLOT_GROUP_FILL_FAIL;
                        }
                        // else stay 0
                    } else if (outcome.getConclusion() != null) {
                        switch (outcome.getConclusion()) {
                            case "SUCCESSFUL":
                                group = PLOT_GROUP_FILL_PASS;
                                break;
                            case "INCONCLUSIVE":
                                group = PLOT_GROUP_FILL_INCONCLUSIVE;
                                break;
                            default:
                                group = PLOT_GROUP_FILL_FAIL;
                                break;
                        }
                    }
                    if (outcome.getConclusion() != null) {
                        label = outcome.getConclusion();
                    }


                    break;
                case "EiffelConfidenceLevelModifiedEvent":

                    String result = event.getEiffelEvents().get(TRIGGERED).getData().getValue();
                    if (result.equals("SUCCESS")) {
                        group = PLOT_GROUP_FILL_PASS;
                    } else if (result.equals("FAILURE")) {
                        group = PLOT_GROUP_FILL_FAIL;
                    }

                    label = event.getEiffelEvents().get(TRIGGERED).getData().getName();
                    break;
                default:
                    break;
            }
            Random random = new Random();
            y = (int) (y * ((float) 0.5 + (random.nextFloat() * 0.05)));


            if (lastGroup == -1) {
//                items.add(new Item(x, 0, group, null));
            } else if (group != lastGroup) {
                items.add(new Item(x, y, lastGroup, null));
                items.add(new Item(x, 0, lastGroup, null));

                items.add(new Item(x, 0, group, null));

            }
            lastGroup = group;

            items.add(new Item(x, y, group, null));

            if (y > valueMax) {
                valueMax = y;
            }

            // Result
            items.add(new Item(x, y, PLOT_GROUP_RESULT_EXEC, label));

        }
        items.add(new Item(timeLast, 0, PLOT_GROUP_FILL_INCONCLUSIVE, null));
        items.add(new Item(timeLast, 0, PLOT_GROUP_FILL_PASS, null));
        items.add(new Item(timeLast, 0, PLOT_GROUP_FILL_FAIL, null));

        return new Plot(items, timeFirst, timeLast, valueMin, valueMax);
    }

    @RequestMapping(value = "/api/eventChainGraph", produces = "application/json; charset=UTF-8")
    public Graph eventChainGraph(@RequestBody Settings settings, @RequestParam(value = "id", defaultValue = "") String id) {
        Graph graph = new Graph();
        if (id.equals("")) {
            return graph;
        }

        Fetcher fetcher = new Fetcher();
        Events eventsObject = fetcher.getEvents(settings.getSystem().getUrl(), settings.getSystem().isUseCache(), settings.getGeneral().getCacheLifetimeMs());
        HashMap<String, Event> events = eventsObject.getEvents();

        if (!events.containsKey(id)) {
            return graph;
        }

        Event mainEvent = events.get(id);

        HashMap<String, Event> incEvents = new HashMap<>();

        step(settings, mainEvent, incEvents, events, settings.getEventChain().getSteps());

        HashMap<String, Node> nodes = new HashMap<>();
        HashMap<String, Edge> edges = new HashMap<>();

        ArrayList<Node> nodesList = null;
        if (settings.getEventChain().isRelativeXAxis()) {
            nodesList = new ArrayList<>();
        }

        // Nodes
        for (String key : incEvents.keySet()) {
            Event event = incEvents.get(key);

            if (!event.getType().equals(REDIRECT)) {
                Node node = new Node(new DataNode(event.getId(), event.getAggregateOn(), event.getType(), null, 0));
                node.getData().getInfo().put("ID", event.getId());
                node.getData().getInfo().put("Type", event.getType());

                node.getData().setTimes(event.getTimes());
                if (node.getData().getTimes().containsKey(STARTED) && event.getTimes().containsKey(FINISHED)) {
                    node.getData().getTimes().put(EXECUTION, node.getData().getTimes().get(FINISHED) - node.getData().getTimes().get(STARTED));
                }
                long time = event.getTimes().get(TRIGGERED);
                if (time < graph.getTime().getStart()) {
                    graph.getTime().setStart(time);
                }
                if (time > graph.getTime().getFinish()) {
                    graph.getTime().setFinish(time);
                }

                graph.increaseInfo("nodeTypes", node.getData().getType());
                setQuantities(node, event);
                nodes.put(event.getId(), node);
                if (settings.getEventChain().isRelativeXAxis()) {
                    node.setPosition(new Position((int) (node.getData().getTimes().get(TRIGGERED) - graph.getTime().getStart()) / 1000, 0));
                    if (nodesList != null) {
                        nodesList.add(node);
                    }
                }
            }
        }

        // Edges
        for (String key : incEvents.keySet()) {
            Event event = incEvents.get(key);

            if (!event.getType().equals(REDIRECT) && event.getLinks().size() + event.getChildren().size() <= settings.getEventChain().getMaxConnections()) {
                for (Link link : event.getLinks()) {
                    String target = getTarget(link.getTarget(), events);
                    if (!incEvents.containsKey(target)) {
                        Node node = new Node(new DataNode(target, "unknown", "unknown", null));
                        nodes.put(target, node);
                        if (settings.getEventChain().isRelativeXAxis()) {
                            node.setPosition(new Position((int) (event.getTimes().get(TRIGGERED) - graph.getTime().getStart()) / 1000, 0));
                            nodesList.add(node);
                        }
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
                        Node node = new Node(new DataNode(childId, "unknown", "unknown", null));
                        nodes.put(childId, node);
                        if (settings.getEventChain().isRelativeXAxis()) {
                            node.setPosition(new Position((int) (event.getTimes().get(TRIGGERED) - graph.getTime().getStart()) / 1000, 0));
                            nodesList.add(node);
                        }
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

        if (settings.getEventChain().isRelativeXAxis()) {
            nodesList.sort(Comparator.comparingInt(o -> o.getPosition().getX()));
            HashMap<Integer, Integer> lastPositions = new HashMap<>();

            int startY = nodesList.size() * 200;
            int y = startY;
            for (Node node : nodesList) {
                int i = startY;
                while (i > 0) {
//            for (int i = startY; i > 0; i -= 200) {
                    i -= 200;
                    if (lastPositions.containsKey(i)) {
                        if (lastPositions.get(i) + 200 < node.getPosition().getX()) {
                            y = i;
                            break;
                        }
                    } else {
                        y = i;
                        break;
                    }
                }
                node.getPosition().setY(y);
                lastPositions.put(y, node.getPosition().getX());
            }
        }


        for (String key : nodes.keySet()) {
            graph.getElements().add(nodes.get(key));
        }

        for (String key : edges.keySet()) {
            graph.getElements().add(edges.get(key));
        }

        return graph;
    }

    private void step(Settings settings, Event event, HashMap<String, Event> incEvents, HashMap<String, Event> events, int steps) {

        incEvents.put(event.getId(), event);
        if (event.getChildren().size() + event.getLinks().size() > settings.getEventChain().getMaxConnections()) {
            return;
        }
        if (steps <= 0) {
            return;
        }
        if (settings.getEventChain().isDownStream()) {
            ArrayList<Link> links = event.getLinks();
            if (links != null) {
                for (Link link : links) {
                    if (!settings.getEventChain().getBannedLinks().contains(link.getType())) {
                        Event tmpEvent = events.get(getTarget(link.getTarget(), events));
                        int newSteps = steps - 1;
                        step(settings, tmpEvent, incEvents, events, newSteps);
                    }
                }
            }
        }

        if (settings.getEventChain().isUpStream()) {
            ArrayList<ChildLink> children = event.getChildren();
            if (children != null) {
                for (ChildLink child : children) {
                    if (!settings.getEventChain().getBannedLinks().contains(child.getType())) {
                        Event tmpEvent = events.get(child.getChild());
                        int newSteps = steps - 1;
                        step(settings, tmpEvent, incEvents, events, newSteps);
                    }
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
