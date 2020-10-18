package eu.europa.ec.fisheries.uvms.frontend;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Optional;

import eu.cec.digit.ecas.client.Client;
import eu.cec.digit.ecas.client.EcasUtil;
import eu.cec.digit.ecas.client.configuration.EcasConfigurationIntf;
import eu.cec.digit.ecas.client.resolver.service.InteractiveServiceResolver;
import eu.cec.digit.ecas.client.resolver.service.StatefulServiceResolver;
import eu.cec.digit.ecas.util.RFC3986PercentCodec;

@WebServlet(urlPatterns={
  LogoutServlet.URL_PATTERN
})
public class LogoutServlet extends HttpServlet {

  public static final String URL_PATTERN = "/logout";

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    Optional.ofNullable(req.getSession(false)).ifPresent(HttpSession::invalidate);
    resp.setContentType("text/plain");
    EcasConfigurationIntf ecasClientConfig = Client.getConfigFromContext(req.getServletContext());
    if (null != ecasClientConfig) {
      StatefulServiceResolver serviceResolver = (StatefulServiceResolver) ecasClientConfig.getServiceResolver();
      String service;
      if (serviceResolver instanceof InteractiveServiceResolver) {
        service = ((InteractiveServiceResolver) serviceResolver).getServiceForLogin(req, resp);
        if (resp.isCommitted()) {
          return;
        }
        ((InteractiveServiceResolver) serviceResolver).clearState(req, resp);
      } else {
        service = serviceResolver.getService(req);
      }
      service = service.substring(0, service.lastIndexOf(URL_PATTERN) + 1);
      String ecasLogoutUrl = EcasUtil.replace(ecasClientConfig.getLoginUrl(), "login", "logout", -1) + "?url=" + RFC3986PercentCodec.UTF8_PERCENT_CODEC.encode(service);
      resp.getWriter().print(ecasLogoutUrl);
    }
  }
}
