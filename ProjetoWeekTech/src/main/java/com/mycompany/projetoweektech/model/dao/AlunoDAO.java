package com.mycompany.projetoweektech.model.dao;

import com.mycompany.projetoweektech.model.bean.Aluno;
import com.mycompany.projetoweektech.conexao.Conexao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AlunoDAO {

    public boolean inserir(Aluno aluno) {

        String sql = "INSERT INTO aluno (nome_completo, registro_academico, curso, serie, checkin_coffee) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = Conexao.conectar();
            PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, aluno.getNomeCompleto());
            stmt.setString(2, aluno.getRegistroAcademico());
            stmt.setString(3, aluno.getCurso());
            stmt.setString(4, aluno.getSerie());
            stmt.setBoolean(5, aluno.isCheckinCoffee());

            stmt.executeUpdate();

            return true;

        } catch (SQLIntegrityConstraintViolationException e) {
            System.out.println("RA já cadastrado");
            return false;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Aluno> listar() {

        List<Aluno> lista = new ArrayList<>();

        String sql = "SELECT * FROM aluno ORDER BY data_hora_inscricao DESC";

        try (Connection conn = Conexao.conectar();
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Aluno a = new Aluno();

                a.setIdAluno(rs.getInt("id_aluno"));
                a.setNomeCompleto(rs.getString("nome_completo"));
                a.setRegistroAcademico(rs.getString("registro_academico"));
                a.setCurso(rs.getString("curso"));
                a.setSerie(rs.getString("serie"));
                a.setCheckinCoffee(rs.getBoolean("checkin_coffee"));
                a.setDataHoraInscricao(rs.getTimestamp("data_hora_inscricao"));

                lista.add(a);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return lista;
    }

    public Aluno buscarPorId(int id) {

        String sql = "SELECT * FROM aluno WHERE id_aluno = ?";
        Aluno a = null;

        try (Connection conn = Conexao.conectar();
            PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                a = new Aluno();

                a.setIdAluno(rs.getInt("id_aluno"));
                a.setNomeCompleto(rs.getString("nome_completo"));
                a.setRegistroAcademico(rs.getString("registro_academico"));
                a.setCurso(rs.getString("curso"));
                a.setSerie(rs.getString("serie"));
                a.setCheckinCoffee(rs.getBoolean("checkin_coffee"));
                a.setDataHoraInscricao(rs.getTimestamp("data_hora_inscricao"));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return a;
    }
}