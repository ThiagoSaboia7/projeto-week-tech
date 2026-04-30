package com.mycompany.projetoweektech.model.dao;

import com.mycompany.projetoweektech.model.bean.Aluno;
import com.mycompany.projetoweektech.conexao.Conexao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AlunoDAO {

    public void inserir(Aluno aluno) {
        String sql = "INSERT INTO aluno (nome_completo, registro_academico, curso, serie, checkin_coffee) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = Conexao.conectar();
            PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, aluno.getNomeCompleto());
            stmt.setString(2, aluno.getRegistroAcademico());
            stmt.setString(3, aluno.getCurso());
            stmt.setString(4, aluno.getSerie());
            stmt.setBoolean(5, aluno.isCheckinCoffee());

            stmt.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<Aluno> listar() {
        List<Aluno> lista = new ArrayList<>();
        String sql = "SELECT * FROM aluno";

        try (Connection conn = Conexao.conectar();
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Aluno a = new Aluno();
                a.setIdAluno(rs.getInt("id_aluno"));
                a.setNomeCompleto(rs.getString("nome_completo"));
                a.setCurso(rs.getString("curso"));
                lista.add(a);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return lista;
    }
}