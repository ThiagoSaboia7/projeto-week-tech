package com.mycompany.projetoweektech.model.dao;

import com.mycompany.projetoweektech.model.bean.Projeto;
import com.mycompany.projetoweektech.conexao.Conexao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProjetoDAO {

    // 🔹 INSERIR PROJETO
    public int inserir(Projeto p) {

        String sql = "INSERT INTO projeto (nome_projeto, descricao) VALUES (?, ?)";

        try (Connection conn = Conexao.conectar();
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, p.getNomeProjeto());
            stmt.setString(2, p.getDescricao());

            stmt.executeUpdate();

            // 🔑 Retorna o ID gerado (muito importante)
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                return rs.getInt(1);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return -1;
    }

    // 🔹 LISTAR TODOS (ADMIN)
    public List<Projeto> listar() {

        List<Projeto> lista = new ArrayList<>();
        String sql = "SELECT * FROM projeto";

        try (Connection conn = Conexao.conectar();
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Projeto p = new Projeto();

                p.setIdProjeto(rs.getInt("id_projeto"));
                p.setNomeProjeto(rs.getString("nome_projeto"));
                p.setDescricao(rs.getString("descricao"));

                lista.add(p);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return lista;
    }

    // 🔹 BUSCAR POR ID (DETALHES)
    public Projeto buscarPorId(int id) {

        String sql = "SELECT * FROM projeto WHERE id_projeto = ?";
        Projeto p = null;

        try (Connection conn = Conexao.conectar();
            PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                p = new Projeto();

                p.setIdProjeto(rs.getInt("id_projeto"));
                p.setNomeProjeto(rs.getString("nome_projeto"));
                p.setDescricao(rs.getString("descricao"));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return p;
    }
}