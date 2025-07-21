package com.simplon.ttm.config;

import java.net.URI;
import java.util.List;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.mongodb.MongoCommandException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

@Configuration
public class MongoReplicaInitializer {

    @Value("${spring.data.mongodb.uri}")
    private String MONGO_HOST;


    @Bean
    public CommandLineRunner initReplicaSetIfNeeded() {
        return args -> {
            String host = MONGO_HOST.replaceFirst("[\\?|&]replicaSet=[a-zA-Z0-9]+&?", "");
            String mongoHost = new URI(host).getHost() + ":" + new URI(host).getPort();

            int retries = 10;
            int delay = 3000; // 3 secondes

            for (int i = 1; i <= retries; i++) {
                try (MongoClient mongoClient = MongoClients.create(host)) {
                    MongoDatabase adminDb = mongoClient.getDatabase("admin");

                    try {
                        adminDb.runCommand(new Document("replSetGetStatus", 1));
                        System.out.println("Replica Set déjà initialisé.");
                        return;
                    } catch (MongoCommandException e) {
                        if (e.getErrorCode() == 94) {
                            System.out.println("Replica Set non initialisé, on l'initialise...");
                            Document config = new Document("_id", "rs0")
                                    .append("members", List.of(
                                            new Document("_id", 0).append("host", mongoHost)
                                    ));
                            adminDb.runCommand(new Document("replSetInitiate", config));
                            System.out.println("Replica Set initialisé avec succès !");
                            return;
                        } else {
                            throw e;
                        }
                    }
                } catch (Exception e) {
                    System.err.printf("Tentative %d/%d : MongoDB pas encore prêt (%s)\n", i, retries, e.getMessage());
                    if (i == retries)
                        throw new RuntimeException("MongoDB ne répond pas après plusieurs tentatives", e);
                    Thread.sleep(delay);
                }
            }
        };
    }
}