import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class BcryptCheck {
  public static void main(String[] args) {
    System.out.println(new BCryptPasswordEncoder().matches("Pass@123", "$2a$10$6wfnE5uzQNTGtbryWZs8AuzeBH5SnoOcThOpul/rdaVSC76Wf1Sw2"));
  }
}
