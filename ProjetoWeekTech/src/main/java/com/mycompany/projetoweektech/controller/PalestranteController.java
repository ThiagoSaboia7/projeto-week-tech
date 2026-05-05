package com.mycompany.projetoweektech.controller;

import com.mycompany.projetoweektech.model.bean.Palestrante;
import com.mycompany.projetoweektech.model.dao.PalestranteDAO;
import java.io.File;
import java.io.IOException;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

@WebServlet(name = "PalestranteController", urlPatterns = {"/palestrante"})
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024 * 2, // 2MB
    maxFileSize = 1024 * 1024 * 15,      // 15MB (limite por arquivo)
    maxRequestSize = 1024 * 1024 * 50    // 50MB (limite total do formulário)
)
public class PalestranteController extends HttpServlet {

    private final PalestranteDAO dao = new PalestranteDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String action = request.getParameter("action");
        if (action == null) {
            action = "listar";
        }

        switch (action) {
            case "listar":
                List<Palestrante> lista = dao.listar();
                request.setAttribute("palestrantes", lista);
                request.getRequestDispatcher("lista_palestrantes.jsp").forward(request, response);
                break;

            case "novo":
                request.getRequestDispatcher("cadastro_palestrante.jsp").forward(request, response);
                break;

            case "detalhes":
                try {
                    int id = Integer.parseInt(request.getParameter("id"));
                    Palestrante p = dao.buscarPorId(id);
                    request.setAttribute("palestrante", p);
                    request.getRequestDispatcher("detalhes_palestrante.jsp").forward(request, response);
                } catch (NumberFormatException e) {
                    response.sendRedirect("palestrante?action=listar");
                }
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
        String telefone = request.getParameter("telefone");
        String email = request.getParameter("email");
        String tema = request.getParameter("tema");
        String curriculo = request.getParameter("curriculo_path");

        String nomeFinalArquivo = "";
        try {
            Part filePart = request.getPart("briefing"); 
            if (filePart != null && filePart.getSize() > 0) {
                String fileName = filePart.getSubmittedFileName();
                
                nomeFinalArquivo = System.currentTimeMillis() + "_" + fileName;

                String uploadPath = getServletContext().getRealPath("") + File.separator + "uploads";
                File uploadDir = new File(uploadPath);
                if (!uploadDir.exists()) {
                    uploadDir.mkdir();
                }

                filePart.write(uploadPath + File.separator + nomeFinalArquivo);
            }
        } catch (Exception e) {
            System.out.println("Erro ao processar upload: " + e.getMessage());
        }

        if (nome == null || nome.isBlank() || email == null || email.isBlank()) {
            request.setAttribute("erro", "Nome e E-mail são obrigatórios.");
            request.getRequestDispatcher("cadastro_aluno.jsp").forward(request, response);
            return;
        }

        Palestrante p = new Palestrante();
        p.setNomeCompleto(nome);
        p.setTelefone(telefone);
        p.setEmail(email);
        p.setTema(tema);
        p.setCurriculoPath(curriculo);
        
        if (!nomeFinalArquivo.isEmpty()) {
            p.setBriefing("uploads/" + nomeFinalArquivo);
        } else {
            p.setBriefing(request.getParameter("briefing_link")); // Caso seja apenas um link
        }

        dao.inserir(p);
        response.sendRedirect(request.getContextPath() + "/palestrante?action=listar");
    }
}