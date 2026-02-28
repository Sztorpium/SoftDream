package hu.softdream.service;


import hu.softdream.entity.UserAuth;
import hu.softdream.repository.UserAuthRepository;
import hu.softdream.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

        private final UserAuthRepository userAuthRepository;

        @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
            UserAuth userAuth = userAuthRepository.findByUser_Username(username)
                    .orElseThrow(() -> new UsernameNotFoundException("A felhasználó nem található: " + username));

            return new CustomUserDetails(userAuth);
        }
}
