package eu.europa.ec.fisheries.uvms.frontend;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.annotation.WebServlet;
import javax.servlet.ServletException;
import java.io.IOException;
import java.util.Optional;
import java.util.stream.Stream;

@WebServlet(urlPatterns={
  "/uvms-poc/subscriptions/*"
})
public class FileServlet extends HttpServlet {

  private static final String[] FILE_SUFFIXES = new String[] {".png", ".svg", ".woff", ".eot", ".ttf", ".ico", ".html", ".js", ".css"};

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    String pathInfo = Optional.ofNullable(req.getPathInfo()).orElse("");
    if (Stream.of(FILE_SUFFIXES).anyMatch(pathInfo::endsWith)) {
      int index = pathInfo.lastIndexOf("/assets/");
      if (index == -1) {
        index = pathInfo.lastIndexOf("/");
      }
      if (index >= 0) {
        resp.sendRedirect(req.getContextPath() + "/uvms-poc" + pathInfo.substring(index));
      } else {
        resp.sendError(HttpServletResponse.SC_NOT_FOUND);
      }
    } else {
      req.getRequestDispatcher("/uvms-poc/index.html").forward(req, resp);
    }
  }
}
