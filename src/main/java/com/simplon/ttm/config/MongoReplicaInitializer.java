package com.simplon.ttm.config;

import java.util.List;

import org.bson.Document;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.mongodb.MongoCommandException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

@Configuration
public class MongoReplicaInitializer {
    @Bean
    public CommandLineRunner initReplicaSetIfNeeded() {
        return args -> {
            try (MongoClient mongoClient = MongoClients.create("mongodb://localhost:27017")) {
                MongoDatabase adminDb = mongoClient.getDatabase("admin");

                // Je vérifie si le replica est déjà initialisé
                try {
                    adminDb.runCommand(new Document("replSetGetStatus", 1));
                    System.out.println("Replica Set déjà initialisé, rien à faire.");
                    return; // on arrête là
                } catch (MongoCommandException e) {
                    if (e.getErrorCode() == 94) {
                        System.out.println("Replica Set non initialisé, on l'initialise...");
                        // Code d’erreur 94 = NotYetInitialized
                    } else {
                        throw e; // autre erreur → on la remonte
                    }
                }
                // S'il ne l'est pas je l'initialise
                Document config = new Document("_id", "rs0")
                        .append("members", List.of(
                                new Document("_id", 0).append("host", "localhost:27017")
                        ));

                adminDb.runCommand(new Document("replSetInitiate", config));
                System.out.println("Replica Set initialisé avec succès !");
            } catch (Exception e) {
                System.err.println("Erreur pendant l'initialisation du replica set : " + e.getMessage());
            }
        };
    }
}
