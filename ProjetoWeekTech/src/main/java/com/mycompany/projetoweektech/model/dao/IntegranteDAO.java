package com.mycompany.projetoweektech.model.dao;

import com.mycompany.projetoweektech.model.bean.Integrante;
import com.mycompany.projetoweektech.conexao.Conexao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class IntegranteDAO {

    // 🔹 INSERIR INTEGRANTE
    public void inserir(Integrante i) {

        String sql = "INSERT INTO integrante (nome, registro_academico, id_projeto) VALUES (?, ?, ?)";

        try (Connection conn = Conexao.conectar();
            PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, i.getNome());
            stmt.setString(2, i.getRegistroAcademico());
            stmt.setInt(3, i.getIdProjeto());

            stmt.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 🔹 LISTAR POR PROJETO
    public List<Integrante> listarPorProjeto(int idProjeto) {

        List<Integrante> lista = new ArrayList<>();
        String sql = "SELECT * FROM integrante WHERE id_projeto = ?";

        try (Connection conn = Conexao.conectar();
            PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idProjeto);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                Integrante i = new Integrante();

                i.setIdIntegrante(rs.getInt("id_integrante"));
                i.setNome(rs.getString("nome"));
                i.setRegistroAcademico(rs.getString("registro_academico"));
                i.setIdProjeto(rs.getInt("id_projeto"));

                lista.add(i);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return lista;
    }
}