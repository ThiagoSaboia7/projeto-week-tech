package com.mycompany.projetoweektech.controller;

import com.mycompany.projetoweektech.model.bean.Aluno;
import com.mycompany.projetoweektech.model.dao.AlunoDAO;

import java.io.IOException;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet(name = "AlunoController", urlPatterns = {"/aluno"})
public class AlunoController extends HttpServlet {

    private final AlunoDAO dao = new AlunoDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String action = request.getParameter("action");
        if (action == null) {
            action = "listar";
        }

        // PROTEÇÃO: Se a ação for 'listar', verifica se é ADM
        if (action.equals("listar")) {
            HttpSession session = request.getSession();
            if (session.getAttribute("adminLogado") == null) {
                response.sendRedirect("login.jsp"); // Se não for ADM, manda pro login
                return;
            }
        }

        switch (action) {

            case "listar":
                List<Aluno> lista = dao.listar();
                request.setAttribute("alunos", lista);
                request.getRequestDispatcher("lista_alunos.jsp").forward(request, response);
                break;

            case "novo":
                request.getRequestDispatcher("cadastro_aluno.jsp").forward(request, response);
                break;

            default:
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String nome = request.getParameter("nome_completo");
        String ra = request.getParameter("registro_academico");
        String curso = request.getParameter("curso");
        String serie = request.getParameter("serie");
        boolean coffee = request.getParameter("checkin_coffee") != null;

        if (nome == null || nome.isBlank() || ra == null || ra.isBlank()) {
            request.setAttribute("erro", "Nome e RA são campos obrigatórios.");
            request.getRequestDispatcher("cadastro_aluno.jsp").forward(request, response);
            return;
        }

        if (ra.length() > 10) {
            request.setAttribute("erro", "O RA deve ter no máximo 10 caracteres.");
            request.setAttribute("nome_preenchido", nome);
            request.getRequestDispatcher("cadastro_aluno.jsp").forward(request, response);
            return;
        }

        Aluno aluno = new Aluno();
        aluno.setNomeCompleto(nome);
        aluno.setRegistroAcademico(ra);
        aluno.setCurso(curso);
        aluno.setSerie(serie);
        aluno.setCheckinCoffee(coffee);

        boolean sucesso = dao.inserir(aluno);

        if (sucesso) {
            response.sendRedirect(request.getContextPath() + "/aluno?action=listar");
        } else {
            request.setAttribute("erro", "Erro ao cadastrar: Verifique se o RA já está cadastrado.");
            request.setAttribute("nome_preenchido", nome);
            request.setAttribute("ra_preenchido", ra);
            request.setAttribute("curso_preenchido", curso);
            request.setAttribute("serie_preenchido", serie);
            request.getRequestDispatcher("cadastro_aluno.jsp").forward(request, response);
        }
    }
}
