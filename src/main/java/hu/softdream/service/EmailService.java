package hu.softdream.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from}")
    private String fromAddress;

    @Async
    public void sendBookingConfirmation(String to, String username, Integer bookingId,
                                        String roomNumber, String checkIn, String checkOut) {
        String subject = "Foglalás megerősítve – SoftDream (#" + bookingId + ")";

        String body = String.format(
                "Kedves %s!%n%n" +
                        "Örömmel értesítjük, hogy foglalása sikeresen megerősítésre került.%n%n" +
                        "Foglalás részletei:%n" +
                        "  Foglalás azonosítója : %d%n" +
                        "  Szoba száma          : %s%n" +
                        "  Bejelentkezés        : %s%n" +
                        "  Kijelentkezés        : %s%n%n" +
                        "Köszönjük, hogy a SoftDream-et választotta!%n%n" +
                        "Üdvözlettel,%n" +
                        "SoftDream csapat",
                username,
                bookingId,
                roomNumber,
                checkIn,
                checkOut
        );

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
            log.info("Foglalás megerősítő e-mail elküldve: {} (foglalás #{})", to, bookingId);
        } catch (MailException e) {
            log.error("Nem sikerült elküldeni a megerősítő e-mailt ({}, foglalás #{}): {}", to, bookingId, e.getMessage());
        }
    }
}