package com.mycompany.projetoweektech.model.bean;

import java.util.Date;

public class Palestrante {

    private int idPalestrante;
    private String nomeCompleto;
    private String telefone;
    private String email;
    private String tema;
    private String curriculoPath;
    private String briefing;
    private Date dataHoraInscricao;

    // GETTERS E SETTERS

    public int getIdPalestrante() {
        return idPalestrante;
    }

    public void setIdPalestrante(int idPalestrante) {
        this.idPalestrante = idPalestrante;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTema() {
        return tema;
    }

    public void setTema(String tema) {
        this.tema = tema;
    }

    public String getCurriculoPath() {
        return curriculoPath;
    }

    public void setCurriculoPath(String curriculoPath) {
        this.curriculoPath = curriculoPath;
    }

    public String getBriefing() {
        return briefing;
    }

    public void setBriefing(String briefing) {
        this.briefing = briefing;
    }

    public Date getDataHoraInscricao() {
        return dataHoraInscricao;
    }

    public void setDataHoraInscricao(Date dataHoraInscricao) {
        this.dataHoraInscricao = dataHoraInscricao;
    }
}