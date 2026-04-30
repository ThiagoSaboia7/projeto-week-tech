package com.mycompany.projetoweektech.model.dao;

import com.mycompany.projetoweektech.model.bean.Administrador;
import com.mycompany.projetoweektech.conexao.Conexao;

import java.sql.*;

public class AdministradorDAO {

    public Administrador login(String email, String senha) {
        String sql = "SELECT * FROM administrador WHERE email = ?";

        try (Connection conn = Conexao.conectar();
            PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                if (rs.getString("senha").equals(senha)) {
                    Administrador adm = new Administrador();
                    adm.setIdAdministrador(rs.getInt("id_administrador"));
                    adm.setEmail(rs.getString("email"));
                    return adm;
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
}