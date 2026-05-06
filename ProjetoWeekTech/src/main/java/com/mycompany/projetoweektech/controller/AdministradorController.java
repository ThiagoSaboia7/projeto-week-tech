package com.mycompany.projetoweektech.controller;

import com.mycompany.projetoweektech.model.bean.Administrador;
import com.mycompany.projetoweektech.model.dao.AdministradorDAO;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet(name = "LoginController", urlPatterns = {"/login", "/logout"})
public class AdministradorController extends HttpServlet {

    private final AdministradorDAO dao = new AdministradorDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String uri = request.getRequestURI();

        if (uri.endsWith("/logout")) {
            request.getSession().invalidate();
            response.sendRedirect("index.jsp");
        } else {
            request.getRequestDispatcher("login.jsp").forward(request, response);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String email = request.getParameter("email");
        String senha = request.getParameter("senha");

        Administrador admin = dao.autenticar(email, senha);

        if (admin != null) {
            HttpSession session = request.getSession();
            session.setAttribute("adminLogado", admin);
            response.sendRedirect("aluno?action=listar");
        } else {
            request.setAttribute("erro", "Acesso negado: Credenciais inválidas.");
            request.getRequestDispatcher("login.jsp").forward(request, response);
        }
    }
}
