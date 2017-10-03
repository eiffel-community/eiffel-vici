package vici.api;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vici.Fetcher;
import vici.api.entities.ReturnData;
import vici.api.entities.settings.EiffelEventRepository;
import vici.api.entities.settings.RepositorySettings;
import vici.api.entities.settings.Settings;
import vici.entities.ChildLink;
import vici.entities.Cytoscape.*;
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
import static vici.ViciApplication.settingsHandler;
import static vici.entities.Event.*;

@RestController
public class ApiController {

    private static final int PLOT_GROUP_RESULT_EXEC = 0;
    private static final int PLOT_GROUP_FILL_INCONCLUSIVE = 1;
    private static final int PLOT_GROUP_FILL_PASS = 2;
    private static final int PLOT_GROUP_FILL_FAIL = 3;

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

    private long getSortTime(Event event) {
        if (event.getType().equals(REDIRECT)) {
            return 0;
        }
        if (event.getTimes().containsKey(TRIGGERED)) {
            return event.getTimes().get(TRIGGERED);
        } else if (event.getTimes().containsKey(STARTED)) {
            return event.getTimes().get(STARTED);
        } else if (event.getTimes().containsKey(FINISHED)) {
            return event.getTimes().get(FINISHED);
        } else if (event.getTimes().containsKey(CANCELED)) {
            return event.getTimes().get(CANCELED);
        }
        System.out.println("Error: no time found for event " + event.getId());
        return 0;
    }

    @RequestMapping(value = "/api/saveSettings", produces = "application/json; charset=UTF-8")
    public void saveSettings(@RequestBody Settings settings) {
        settingsHandler.saveSettings(settings);
    }

    @RequestMapping(value = "/api/getSettings", produces = "application/json; charset=UTF-8")
    public Settings getSettings() {
        return settingsHandler.getSettings();
    }

    @RequestMapping(value = "/api/resetSettingsDefault", produces = "application/json; charset=UTF-8")
    public Settings resetSettingsDefault() {
        return settingsHandler.resetSettingsDefault();
    }

    @RequestMapping(value = "/api/getDefaultSettings", produces = "application/json; charset=UTF-8")
    public Settings getDefaultSettings() {
        return settingsHandler.getDefaultSettings();
    }

    @RequestMapping(value = "/api/getDefaultEiffelEventRepository", produces = "application/json; charset=UTF-8")
    public EiffelEventRepository getDefaultEiffelEventRepository() {
        return settingsHandler.getDefaultRepository();
    }

    @RequestMapping(value = "/api/aggregationGraph", produces = "application/json; charset=UTF-8")
    public ReturnData aggregationGraph(@RequestBody EiffelEventRepository eiffelEventRepository) {

//        JSONObject jsonObject = new JSONObject(settings);
//        System.out.println(jsonObject.toString());

        Fetcher fetcher = new Fetcher();
        Events eventsObject = fetcher.getEvents(eiffelEventRepository.getUrl(), eiffelEventRepository.getRepositorySettings().getCacheLifeTimeMs());
        HashMap<String, Event> events = eventsObject.getEvents();

        ArrayList<Element> elements = new ArrayList<>();

        HashMap<String, Node> nodes = new HashMap<>();
        HashMap<String, Edge> edges = new HashMap<>();

        // Nodes
        for (String key : events.keySet()) {
            Event event = events.get(key);

            if (!event.getType().equals(REDIRECT)) {
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

        return new ReturnData(elements, eventsObject.getTimeCollected());
    }

    private String getEdgeId(String source, String target, String type) {
        return source + "-" + type + "-" + target;
    }

    @RequestMapping(value = "/api/detailedEvents", produces = "application/json; charset=UTF-8")
    public ReturnData detailedEvents(@RequestBody EiffelEventRepository eiffelEventRepository) {

        Fetcher fetcher = new Fetcher();
        Events eventsObject = fetcher.getEvents(eiffelEventRepository.getUrl(), eiffelEventRepository.getRepositorySettings().getCacheLifeTimeMs());
        HashMap<String, Event> events = eventsObject.getEvents();

        ArrayList<HashMap<String, String>> data = new ArrayList<>();
        ArrayList<Column> columns = new ArrayList<>();

        HashSet<String> cSet = new HashSet<>();

        for (String key : events.keySet()) {
            Event event = events.get(key);
            if (!event.getType().equals(REDIRECT)) {
                if (event.getAggregateOn().equals(eiffelEventRepository.getRepositorySettings().getDetailsTargetId())) {
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
                            if (event.getEiffelEvents().containsKey(FINISHED)) {
                                Outcome outcome = event.getEiffelEvents().get(FINISHED).getData().getOutcome();
                                if (outcome.getConclusion() != null) {
                                    addColumn(row, columns, cSet, "conclusion", outcome.getConclusion());
                                }
                                if (outcome.getVerdict() != null) {
                                    addColumn(row, columns, cSet, "verdict", outcome.getVerdict());
                                }
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

        return new ReturnData(new Source(columns, data), eventsObject.getTimeCollected());
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
    public ReturnData detailedPlot(@RequestBody EiffelEventRepository eiffelEventRepository, @RequestParam(value = "name", defaultValue = "") String name) {

        System.out.println(name);

        Fetcher fetcher = new Fetcher();
        Events eventsObject = fetcher.getEvents(eiffelEventRepository.getUrl(), eiffelEventRepository.getRepositorySettings().getCacheLifeTimeMs());
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

        eventsList.sort(Comparator.comparingLong(this::getSortTime));

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

                    if (event.getEiffelEvents().containsKey(FINISHED)) {
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

        return new ReturnData(new Plot(items, timeFirst - 1000, timeLast + 1000, valueMin, valueMax), eventsObject.getTimeCollected());
    }

    public Graph getChainGraph(RepositorySettings repositorySettings, ArrayList<Event> baseEvents, HashMap<String, Event> events) {
        Graph graph = new Graph();

        HashMap<String, Event> incEvents = new HashMap<>();

        for (Event baseEvent : baseEvents) {
            step(repositorySettings, baseEvent, incEvents, events, repositorySettings.getEventChainMaxSteps());
        }

        HashMap<String, Node> nodes = new HashMap<>();
        HashMap<String, Edge> edges = new HashMap<>();

        ArrayList<Node> nodesList = null;
        if (repositorySettings.isEventChainTimeRelativeXAxis()) {
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
                if (repositorySettings.isEventChainTimeRelativeXAxis()) {
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

            if (!event.getType().equals(REDIRECT) && event.getLinks().size() + event.getChildren().size() <= repositorySettings.getEventChainMaxConnections()) {
                for (Link link : event.getLinks()) {
                    String target = getTarget(link.getTarget(), events);
                    if (!incEvents.containsKey(target)) {
                        Node node = new Node(new DataNode(target, "unknown", "unknown", null));
                        nodes.put(target, node);
                        if (repositorySettings.isEventChainTimeRelativeXAxis()) {
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
                        if (repositorySettings.isEventChainTimeRelativeXAxis()) {
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

        if (repositorySettings.isEventChainTimeRelativeXAxis()) {
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

    private void step(RepositorySettings repositorySettings, Event event, HashMap<String, Event> incEvents, HashMap<String, Event> events, int steps) {

        incEvents.put(event.getId(), event);
        if (event.getChildren().size() + event.getLinks().size() > repositorySettings.getEventChainMaxConnections()) {
            return;
        }
        if (steps <= 0) {
            return;
        }
        if (repositorySettings.isEventChainGoDownStream()) {
            ArrayList<Link> links = event.getLinks();
            if (links != null) {
                for (Link link : links) {
                    if (!repositorySettings.getEventChainBannedLinks().contains(link.getType())) {
                        Event tmpEvent = events.get(getTarget(link.getTarget(), events));
                        int newSteps = steps - 1;
                        step(repositorySettings, tmpEvent, incEvents, events, newSteps);
                    }
                }
            }
        }

        if (repositorySettings.isEventChainGoUpStream()) {
            ArrayList<ChildLink> children = event.getChildren();
            if (children != null) {
                for (ChildLink child : children) {
                    if (!repositorySettings.getEventChainBannedLinks().contains(child.getType())) {
                        Event tmpEvent = events.get(child.getChild());
                        int newSteps = steps - 1;
                        step(repositorySettings, tmpEvent, incEvents, events, newSteps);
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

    @RequestMapping(value = "/api/eventChainGraph", produces = "application/json; charset=UTF-8")
    public ReturnData eventChainGraph(@RequestBody EiffelEventRepository eiffelEventRepository) {
        if (eiffelEventRepository.getRepositorySettings().getEventChainTargetId().equals("")) {
            return new ReturnData(new Graph());
        }

        Fetcher fetcher = new Fetcher();
        Events eventsObject = fetcher.getEvents(eiffelEventRepository.getUrl(), eiffelEventRepository.getRepositorySettings().getCacheLifeTimeMs());
        HashMap<String, Event> events = eventsObject.getEvents();

        if (!events.containsKey(eiffelEventRepository.getRepositorySettings().getEventChainTargetId())) {
            return new ReturnData(new Graph(), eventsObject.getTimeCollected());
        }

        Event mainEvent = events.get(eiffelEventRepository.getRepositorySettings().getEventChainTargetId());
        ArrayList<Event> baseEvents = new ArrayList<>();
        baseEvents.add(mainEvent);

        return new ReturnData(getChainGraph(eiffelEventRepository.getRepositorySettings(), baseEvents, events), eventsObject.getTimeCollected());
    }

    @RequestMapping(value = "/api/liveEventChainGraph", produces = "application/json; charset=UTF-8")
    public ReturnData liveEventChainGraph(@RequestBody EiffelEventRepository eiffelEventRepository) {

        Fetcher fetcher = new Fetcher();
        // TODO: fetch ony base events based on time added
        Events eventsObject = fetcher.getEvents(eiffelEventRepository.getUrl(), eiffelEventRepository.getRepositorySettings().getCacheLifeTimeMs());
        HashMap<String, Event> events = eventsObject.getEvents();

        Collection<Event> eventsCollection = events.values();
        ArrayList<Event> eventsList = new ArrayList<>(eventsCollection);

        eventsList.sort(Comparator.comparingLong(this::getSortTime));

        ArrayList<Event> baseEvents = new ArrayList<>();

        int i = eventsList.size() - 1;
        int count = 0;
        while (count < eiffelEventRepository.getRepositorySettings().getStreamBaseEvents() && i >= 0) {
            Event tmpEvent = eventsList.get(i);
            if (!tmpEvent.getType().equals(REDIRECT)) {
                baseEvents.add(tmpEvent);
                count++;
            }
            i--;
        }

        return new ReturnData(getChainGraph(eiffelEventRepository.getRepositorySettings(), baseEvents, events), eventsObject.getTimeCollected());
    }
}
