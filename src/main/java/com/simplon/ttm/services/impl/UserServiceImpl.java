package com.simplon.ttm.services.impl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplon.ttm.dto.RegisterDto;
import com.simplon.ttm.models.User;
import com.simplon.ttm.models.UserRole;
import com.simplon.ttm.repositories.UserRepository;
import com.simplon.ttm.services.UserService;

@Service
public class UserServiceImpl implements UserService {
    
    private UserRepository userRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public User saveGodparent(RegisterDto user) {
           
            User godeparent = User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .role(UserRole.GODPARENT)
                .build();
            return userRepository.save(godeparent);
     
    }

    public User saveLeaderProject(RegisterDto user){
            User leaderProject = User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .role(UserRole.LEADERPROJECT)
                .build();
            return userRepository.save(leaderProject);
    }

    public User saveAdmin(RegisterDto user) {
            User admin = User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .role(UserRole.ADMIN)
                .build();
            return userRepository.save(admin);
    }

    public User saveUser(RegisterDto user) {
            User simpleUser = User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .role(UserRole.USER)
                .build();
            return userRepository.save(simpleUser);
    }

    public Optional<User> getUserByRole(UserRole role) {
            return userRepository.findByRole(role);
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
     * @return
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

    



