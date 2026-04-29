package com.mycompany.projetoweektech.model.bean;

import java.util.Date;

public class Aluno {

    private int idAluno;
    private String nomeCompleto;
    private String registroAcademico;
    private String curso;
    private String serie;
    private boolean checkinCoffee;
    private Date dataHoraInscricao;

    // GETTERS E SETTERS

    public int getIdAluno() {
        return idAluno;
    }

    public void setIdAluno(int idAluno) {
        this.idAluno = idAluno;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getRegistroAcademico() {
        return registroAcademico;
    }

    public void setRegistroAcademico(String registroAcademico) {
        this.registroAcademico = registroAcademico;
    }

    public String getCurso() {
        return curso;
    }

    public void setCurso(String curso) {
        this.curso = curso;
    }

    public String getSerie() {
        return serie;
    }

    public void setSerie(String serie) {
        this.serie = serie;
    }

    public boolean isCheckinCoffee() {
        return checkinCoffee;
    }

    public void setCheckinCoffee(boolean checkinCoffee) {
        this.checkinCoffee = checkinCoffee;
    }

    public Date getDataHoraInscricao() {
        return dataHoraInscricao;
    }

    public void setDataHoraInscricao(Date dataHoraInscricao) {
        this.dataHoraInscricao = dataHoraInscricao;
    }
}