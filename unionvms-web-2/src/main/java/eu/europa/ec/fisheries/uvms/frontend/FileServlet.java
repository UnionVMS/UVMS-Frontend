package eu.europa.ec.fisheries.uvms.frontend;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.annotation.WebServlet;
import javax.servlet.ServletException;
import java.io.IOException;

@WebServlet(urlPatterns={
  "/uvms-poc/subscriptions/*"
})
public class FileServlet extends HttpServlet {
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    req.getRequestDispatcher("/uvms-poc/index.html").forward(req, resp);
  }
}
