package vici.api.dummy;

import com.mongodb.Block;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;

import static com.mongodb.client.model.Filters.*;

@RestController
public class DummyController {

    @RequestMapping("/api/dummy/eiffelevents")
    public ArrayList<Document> eiffelEvents(@RequestParam(value = "from", defaultValue = "") String from, @RequestParam(value = "to", defaultValue = "") String to, @RequestParam(value = "limit", defaultValue = "0") String limit, @RequestParam(value = "id", defaultValue = "") String id, @RequestParam(value = "name", defaultValue = "") String name) {
        long fromLong;
        long toLong;
        int limitInt;

        if (from.equals("")) {
            fromLong = 0;
        } else {
            fromLong = Long.parseLong(from);
        }
        if (to.equals("")) {
//            toLong = System.currentTimeMillis();
            toLong = Long.MAX_VALUE;
        } else {
            toLong = Long.parseLong(to);
        }
        limitInt = Integer.parseInt(limit);


//        MongoClient mongoClient = new MongoClient(new MongoClientURI("mongodb://localhost:27017"));
        MongoClient mongoClient = new MongoClient();

        MongoDatabase database = mongoClient.getDatabase("vici");
        MongoCollection<Document> collection = database.getCollection("eiffel");

        ArrayList<Document> documents = new ArrayList<>();

        Block<Document> printBlock = document -> {
            document.remove("_id");
            documents.add(document);
        };

//        Block<Document> printBlock = documents::add;

        Bson filters = and(gte("meta.time", fromLong), lte("meta.time", toLong));
        if (!name.equals("")) {
            filters = and(filters, elemMatch("data.customData", and(eq("key", "name"), eq("value", name))));
        }
        collection.find(filters).limit(limitInt).forEach(printBlock);


        return documents;
    }
}
