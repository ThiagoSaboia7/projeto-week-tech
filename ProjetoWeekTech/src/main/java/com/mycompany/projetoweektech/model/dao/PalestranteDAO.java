package com.mycompany.projetoweektech.model.dao;

import com.mycompany.projetoweektech.model.bean.Palestrante;
import com.mycompany.projetoweektech.conexao.Conexao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PalestranteDAO {

    // 🔹 CADASTRO
    public void inserir(Palestrante p) {

        String sql = "INSERT INTO palestrante "
                + "(nome_completo, telefone, email, tema, curriculo_path, briefing) "
                + "VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = Conexao.conectar();
            PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, p.getNomeCompleto());
            stmt.setString(2, p.getTelefone());
            stmt.setString(3, p.getEmail());
            stmt.setString(4, p.getTema());
            stmt.setString(5, p.getCurriculoPath());
            stmt.setString(6, p.getBriefing());

            stmt.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 🔹 LISTAR TODOS (ADMIN VÊ)
    public List<Palestrante> listar() {

        List<Palestrante> lista = new ArrayList<>();
        String sql = "SELECT * FROM palestrante";

        try (Connection conn = Conexao.conectar();
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Palestrante p = new Palestrante();

                p.setIdPalestrante(rs.getInt("id_palestrante"));
                p.setNomeCompleto(rs.getString("nome_completo"));
                p.setTelefone(rs.getString("telefone"));
                p.setEmail(rs.getString("email"));
                p.setTema(rs.getString("tema"));
                p.setCurriculoPath(rs.getString("curriculo_path"));
                p.setBriefing(rs.getString("briefing"));
                p.setDataHoraInscricao(rs.getTimestamp("data_hora_inscricao"));

                lista.add(p);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return lista;
    }

    // 🔹 BUSCAR POR ID (VER DETALHES)
    public Palestrante buscarPorId(int id) {

        String sql = "SELECT * FROM palestrante WHERE id_palestrante = ?";
        Palestrante p = null;

        try (Connection conn = Conexao.conectar();
            PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                p = new Palestrante();

                p.setIdPalestrante(rs.getInt("id_palestrante"));
                p.setNomeCompleto(rs.getString("nome_completo"));
                p.setTelefone(rs.getString("telefone"));
                p.setEmail(rs.getString("email"));
                p.setTema(rs.getString("tema"));
                p.setCurriculoPath(rs.getString("curriculo_path"));
                p.setBriefing(rs.getString("briefing"));
                p.setDataHoraInscricao(rs.getTimestamp("data_hora_inscricao"));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return p;
    }
}