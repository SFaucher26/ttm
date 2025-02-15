package com.simplon.ttm.services.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.simplon.ttm.dto.RegisterDto;
import com.simplon.ttm.models.User;
import com.simplon.ttm.models.UserRole;
import com.simplon.ttm.repositories.UserRepository;
import com.simplon.ttm.services.UserService;

@Service
public class UserServiceImpl implements UserService {
    
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder){

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User saveUserWithRole(RegisterDto user) {
        // Validation et conversion du champ role en UserRole
        UserRole role;
        try {
            role = UserRole.valueOf(String.valueOf(user.getRole()).toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + user.getRole());
        }

        // Création et sauvegarde de l'utilisateur
        User newUser = User.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .password(passwordEncoder.encode(user.getPassword()))
                .role(role)
                .build();
        return userRepository.save(newUser);
    }

    /**
     * Méthode qui permet d'afficher les users avec le bon role au user connecté
     * @param username
     * @return
     */
    public List<User> getUsersVisibleToCurrentUser(String username) {
        // Récupére l'utilisateur connecté
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Détermine le rôle visible pour cet utilisateur
        UserRole visibleRole;
        if (currentUser.getRole() == UserRole.GODPARENT) {
            visibleRole = UserRole.LEADERPROJECT;
        } else if (currentUser.getRole() == UserRole.LEADERPROJECT) {
            visibleRole = UserRole.GODPARENT;
        } else {
            throw new AccessDeniedException("Role not allowed to view users");
        }
        // Retourner les utilisateurs ayant le rôle visible
        return userRepository.findByRole(visibleRole);
    }
    
    public Optional<User> getUserByUsername(String username) {
            return userRepository.findByUsername(username);
        }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }


    /**
     * Service qui permet de sauver un match entre deux users
     * @param userId1
     * @param userId2
     * @return boolean
     */
    public boolean saveMatch(long userId1, long userId2) {
        Optional <User> userA = userRepository.findById(userId1);
        Optional<User> userB = userRepository.findById(userId2);

        if(userA.isPresent() && userB.isPresent()){
            User user1 = userA.get();
            User user2 = userB.get();

            user1.getUser1().add(user2);
            user2.getUser2().add(user1);
    
            userRepository.save(user1);
            userRepository.save(user2);
            return true;
        }
        return false;
    }
}

    



