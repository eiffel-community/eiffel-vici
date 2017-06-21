package vici.api.dummy;

import com.mongodb.Block;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;

import static com.mongodb.client.model.Filters.*;

@RestController
public class DummyController {

    @RequestMapping("/api/dummy/eiffelevents")
    public ArrayList<Document> eiffelEvents(@RequestParam(value = "from", defaultValue = "") String from, @RequestParam(value = "to", defaultValue = "") String to, @RequestParam(value = "limit", defaultValue = "0") String limit) {
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

        if(limitInt > 0){
            collection.find(and(gte("meta.time", fromLong), lte("meta.time", toLong))).limit(limitInt).forEach(printBlock);
        } else {
            collection.find(and(gte("meta.time", fromLong), lte("meta.time", toLong))).forEach(printBlock);
        }


        return documents;
    }

    @RequestMapping("/api/dummy/eiffelevent")
    public ArrayList<Document> eiffelEvent(@RequestParam(value = "id", defaultValue = "") String id) {

//        MongoClient mongoClient = new MongoClient(new MongoClientURI("mongodb://localhost:27017"));
        MongoClient mongoClient = new MongoClient();

        MongoDatabase database = mongoClient.getDatabase("vici");
        MongoCollection<Document> collection = database.getCollection("eiffel");

        Document document;
        if(!id.equals("")){
            document = collection.find(eq("meta.id", id)).first();
        } else {
            document = collection.find().first();
        }
        return new ArrayList<Document>() {{
            document.remove("_id");
            add(document);
        }};
    }
}
