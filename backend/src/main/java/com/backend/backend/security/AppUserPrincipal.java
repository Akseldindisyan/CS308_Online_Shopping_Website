package com.backend.backend.security;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.backend.backend.persistence.entity.UserEntity;
@Getter
@Setter
public class AppUserPrincipal implements UserDetails {

    private final UUID userId;
    private final String username;
    private final String password;
    private final UserEntity.Role role;

    public AppUserPrincipal(UserEntity user) {
        this.userId = user.getID();
        this.username = user.getUsername();
        this.password = user.getPassword();
        this.role = user.getRole();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

}

