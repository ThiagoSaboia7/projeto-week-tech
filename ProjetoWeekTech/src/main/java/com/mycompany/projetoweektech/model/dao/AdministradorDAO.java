package com.mycompany.projetoweektech.model.dao;

import com.mycompany.projetoweektech.model.bean.Administrador;
import com.mycompany.projetoweektech.conexao.Conexao;

import java.sql.*;

public class AdministradorDAO {

    public Administrador autenticar(String email, String senha) {
        String sql = "SELECT * FROM administrador WHERE email = ? AND senha = ?";
        try (Connection conn = Conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            stmt.setString(2, senha);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Administrador admin = new Administrador();
                admin.setIdAdministrador(rs.getInt("id_administrador"));
                admin.setEmail(rs.getString("email"));
                return admin;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
