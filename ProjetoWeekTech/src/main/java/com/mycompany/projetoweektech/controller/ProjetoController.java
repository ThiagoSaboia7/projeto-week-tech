package com.mycompany.projetoweektech.controller;

import com.mycompany.projetoweektech.model.bean.Projeto;
import com.mycompany.projetoweektech.model.bean.Integrante;
import com.mycompany.projetoweektech.model.dao.ProjetoDAO;
import com.mycompany.projetoweektech.model.dao.IntegranteDAO;

import java.io.IOException;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "ProjetoController", urlPatterns = {"/projeto"})
public class ProjetoController extends HttpServlet {

    private final ProjetoDAO projetoDao = new ProjetoDAO();
    private final IntegranteDAO integranteDao = new IntegranteDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String action = request.getParameter("action");
        if (action == null) {
            action = "listar";
        }

        switch (action) {
            case "listar":
                List<Projeto> lista = projetoDao.listar();
                request.setAttribute("projetos", lista);
                request.getRequestDispatcher("lista_projetos.jsp").forward(request, response);
                break;

            case "novo":
                request.getRequestDispatcher("cadastro_projeto.jsp").forward(request, response);
                break;

            case "detalhes":
                int id = Integer.parseInt(request.getParameter("id"));
                Projeto p = projetoDao.buscarPorId(id);
                // Busca os integrantes vinculados a este ID de projeto
                List<Integrante> integrantes = integranteDao.listarPorProjeto(id);
                
                request.setAttribute("projeto", p);
                request.setAttribute("integrantes", integrantes);
                request.getRequestDispatcher("detalhes_projeto.jsp").forward(request, response);
                break;

            default:
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        // 1. Receber dados do Projeto
        String nomeProjeto = request.getParameter("nome_projeto");
        String descricao = request.getParameter("descricao");

        Projeto proj = new Projeto();
        proj.setNomeProjeto(nomeProjeto);
        proj.setDescricao(descricao);

        // 2. Inserir o projeto e recuperar o ID gerado pelo MySQL
        int idProjetoGerado = projetoDao.inserir(proj);

        if (idProjetoGerado > 0) {
            // 3. Receber Integrantes do formulário (Exemplo de 3 integrantes)
            for (int i = 1; i <= 3; i++) {
                String nomeInt = request.getParameter("integrante_nome_" + i);
                String raInt = request.getParameter("integrante_ra_" + i);

                if (nomeInt != null && !nomeInt.isBlank()) {
                    Integrante ing = new Integrante();
                    ing.setNome(nomeInt);
                    ing.setRegistroAcademico(raInt);
                    ing.setIdProjeto(idProjetoGerado); // O ID que o projetoDao nos deu!
                    
                    integranteDao.inserir(ing);
                }
            }
            response.sendRedirect(request.getContextPath() + "/projeto?action=listar");
        } else {
            request.setAttribute("erro", "Erro ao criar o projeto no banco de dados.");
            request.getRequestDispatcher("cadastro_projeto.jsp").forward(request, response);
        }
    }
}