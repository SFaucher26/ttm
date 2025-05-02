package com.simplon.ttm.services;

import java.io.IOException;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;

import org.bson.BSONObject;
import org.bson.BsonValue;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import com.mongodb.client.AggregateIterable;
import com.mongodb.client.ChangeStreamIterable;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoIterable;
import com.mongodb.client.model.Aggregates;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.changestream.ChangeStreamDocument;
import com.mongodb.client.model.changestream.FullDocument;
import com.mongodb.client.result.InsertOneResult;
import com.mongodb.internal.operation.ChangeStreamOperation;
import com.simplon.ttm.models.User;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MongoService {
    @Value("${spring.mongo.url}")
    private String mongoUrl;
    @Value("${spring.mongo.db}")
    private String mongoDb;
    private MongoClient client;
    private MongoDatabase db;
    private MongoCollection<Document> messageCollection;

    @PostConstruct
    void init() throws IOException {
        log.info("start");
        client = MongoClients.create(mongoUrl);
        db = client.getDatabase(mongoDb);
        messageCollection = db.getCollection("message");
    }

    public BsonValue insert(User sender, User dest, String content) {
        return messageCollection.insertOne(
                        new Document("sender", sender.getId())
                                .append("dest", dest.getId())
                                .append("content", content))
                .getInsertedId();
    }

    public MongoIterable<Document> getMessagesForConversation(String user1, String user2) {
        return messageCollection.aggregate(Arrays.asList(
                        Aggregates.match(
                                Filters.and(
                                        Filters.in("sender", user1, user2),
                                        Filters.in("dest", user1, user2)))))
                .map(v -> v);
    }

    public ChangeStreamIterable<Document> listenForNewMessages(String user1, String user2) {
        return messageCollection
                .watch(Arrays.asList(
                        Aggregates.match(
                                Filters.and(
                                        Filters.in("fullDocument.sender", user1, user2),
                                        Filters.in("fullDocument.dest", user1, user2)))))
                .fullDocument(FullDocument.UPDATE_LOOKUP);
    }

}
