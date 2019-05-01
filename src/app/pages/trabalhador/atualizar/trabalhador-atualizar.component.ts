import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { AptareCrudController } from '../../../components/shared/crud/aptare-crud-controller';
import { Auditoria } from '../../../model/auditoria';
import { CadastroUnico } from '../../../model/cadastro-unico/cadastro-unico';
import { Endereco } from '../../../model/cadastro-unico/endereco';
import { ExtensaoEndereco } from '../../../model/cadastro-unico/extensao-endereco';
import { PessoaFisica } from '../../../model/cadastro-unico/pessoa-fisica';
import { PessoaJuridica } from '../../../model/cadastro-unico/pessoa-juridica';
import { Telefone } from '../../../model/cadastro-unico/telefone';
import { Correio } from '../../../model/correio/correio';
import { Dominio } from '../../../model/geral/dominio';
import { ResponseApi } from '../../../model/response-api';
import { Cbo } from '../../../model/trabalhador/cbo';
import { Trabalhador } from '../../../model/trabalhador/trabalhador';
import { TrabalhadorCbo } from '../../../model/trabalhador/trabalhador-cbo';
import { TrabalhadorDeficiencia } from '../../../model/trabalhador/trabalhador-deficiencia';
import { CorreioService } from '../../../services/correio/correio.service';
import { DominioService } from '../../../services/geral/dominio.service';
import { DialogService } from '../../../services/shared/dialog.service';
import { MensagemService } from '../../../services/shared/mensagem.service';
import { CboService } from '../../../services/trabalhador/cbo.service';
import { TrabalhadorService } from '../../../services/trabalhador/trabalhador.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import {AgendaTrabalhador} from '../../../model/trabalhador/agendaTrabalhador';

@Component({
  selector: 'app-trabalhador-atualizar',
  templateUrl: './trabalhador-atualizar.component.html',
  styleUrls: ['./trabalhador-atualizar.component.css']
})
export class TrabalhadorAtualizarComponent extends AptareCrudController<Trabalhador, {new(): Trabalhador}>{ 

  cadastroUnico: CadastroUnico;

  listaTipoEndereco = [];
  listaTipoTelefone = [];
  listaEstadoCivil = [];
  listaTelefonePf = [];
  listaEndereco = [];
  listaCbo = [];
  listaDeficiencia = [];
  listaTrabalhadorCbo = [];
  listaTrabalhadorDeficiencia = [];
  listaAgendaTrabalhador=[];
  endereco: Endereco;
  telefonePf: Telefone;
  trabalhadorCbo: TrabalhadorCbo;
  trabalhadorDeficiencia: TrabalhadorDeficiencia;

  isLogradouroReadOnly: boolean;
  isBairroReadOnly: boolean;
  isLocalidadeReadOnly: boolean;
  isUfReadOnly: boolean;

  obj;

  myControlCbo: FormControl = new FormControl();
  filteredOptionsCbo: Observable<Cbo[]>;

  constructor(router: Router,
              route: ActivatedRoute,  
              dialog: MatDialog,                   
              service: TrabalhadorService,
              private dominioService: DominioService,
              private correioService: CorreioService,
              private cboService: CboService,
              mensagem: MensagemService,
              dialogService: DialogService) {
    super(router, route, dialog, Trabalhador, service, mensagem, dialogService);    
  }

  displayFnCbo(cbo?: Cbo): string | undefined {
    return cbo ? cbo.nome : undefined;
  }

  private _filterCbo(nome: string): Cbo[] {
    const filterValue = nome.toLowerCase();

    return this.listaCbo.filter(option => option.nome.toLowerCase().indexOf(filterValue) > -1);
  }

  setListasStaticas() {

    super.setListasStaticas();
    this.popularTipoEndereco();
    this.popularEstadoCivil();
    this.popularCbo();
    this.popularDeficiencia();
    this.popularTipoTelefone();

    // Autocomplete cbo
    this.filteredOptionsCbo = this.myControlCbo.valueChanges
    .pipe(
      startWith<string | Cbo>(''),
      map(value => typeof value === 'string' ? value : value.nome),
      map(nome => nome ? this._filterCbo(nome) : this.listaCbo.slice())
    );

  }

  iniciarPaginaInserir() {
    this.objetoAtualiza.ufCtps = 'AC';

    this.endereco = new Endereco();
    this.endereco.extensaoEndereco = new ExtensaoEndereco();
    this.endereco.extensaoEndereco.uf = 'AC';

    this.objetoAtualiza.cadastroUnico = new CadastroUnico();
    this.objetoAtualiza.cadastroUnico.tipoPessoa = 'F';

    this.objetoAtualiza.cadastroUnico.pessoaFisica = new PessoaFisica();
    this.objetoAtualiza.cadastroUnico.pessoaFisica.ufOrgaoEmissorRg = 'AC';
    this.objetoAtualiza.cadastroUnico.pessoaFisica.sexo = 'M';
    this.objetoAtualiza.cadastroUnico.pessoaFisica.estadoCivil = 1;

    this.listaDIAS.forEach(value => this.listaAgendaTrabalhador.push(new AgendaTrabalhador()));

  }

  carregarCadastroUnico(event) {

    // Verificando se existe trabalhador com o cdcun
    if(event.codigo !== null && typeof event.codigo !== 'undefined'){
      
      let objTrb: Trabalhador = new Trabalhador();
      objTrb.codigoCadastroUnico = event.codigo;

       this.service.get(objTrb).subscribe((responseApi:ResponseApi) => {
         
        this.objetoAtualiza = new Trabalhador();
        this.iniciarPaginaInserir();

        if(responseApi['data'] !== null && typeof responseApi['data'] !== 'undefined') {
          this.objetoAtualiza = responseApi['data'];
          this.objetoAtualiza.dataEmissaoCtps = new Date(this.objetoAtualiza.dataEmissaoCtps);
          this.objetoAtualiza.cadastroUnico.pessoaFisica.dataEmissaoRg = new Date(this.objetoAtualiza.cadastroUnico.pessoaFisica.dataEmissaoRg);
          this.objetoAtualiza.cadastroUnico.pessoaFisica.dataNascimento = new Date(this.objetoAtualiza.cadastroUnico.pessoaFisica.dataNascimento);

          // Carregando dados do trabalhador
          this.listaTrabalhadorCbo = [];
          if(typeof this.objetoAtualiza.listaTrabalhadorCbo !== 'undefined') {
            for(let i = 0; i < this.objetoAtualiza.listaTrabalhadorCbo.length; i++) {
              //console.log(this.objetoAtualiza);
              this.objetoAtualiza.listaTrabalhadorCbo[i].descricaoCbo = this.objetoAtualiza.listaTrabalhadorCbo[i].cbo.nome;
              this.listaTrabalhadorCbo.push(this.objetoAtualiza.listaTrabalhadorCbo[i]);
            }
          }
    
          this.listaTrabalhadorDeficiencia = [];
          if(typeof this.objetoAtualiza.listaTrabalhadorDeficiencia !== 'undefined') {
            for(let i = 0; i < this.objetoAtualiza.listaTrabalhadorDeficiencia.length; i++) {
              this.listaTrabalhadorDeficiencia.push(this.objetoAtualiza.listaTrabalhadorDeficiencia[i]);
            }
          }

          this.mensagem.tratarErroPersonalizado("", "Já existe um trabalhador cadastrado com este cpf.");

        } else {

          this.listaTrabalhadorCbo = [];
          this.listaTrabalhadorDeficiencia = [];

        }

        this.objetoAtualiza.cadastroUnico = event;
        this.objetoAtualiza.cadastroUnico.pessoaFisica.dataEmissaoRg = new Date(this.objetoAtualiza.cadastroUnico.pessoaFisica.dataEmissaoRg);
        this.objetoAtualiza.cadastroUnico.pessoaFisica.dataNascimento = new Date(this.objetoAtualiza.cadastroUnico.pessoaFisica.dataNascimento);

        //populando endereco
        this.listaEndereco = [];
    
          if(typeof this.objetoAtualiza.cadastroUnico.listaEndereco !== 'undefined') {
            for(let i = 0; i < this.objetoAtualiza.cadastroUnico.listaEndereco.length; i++) {
    
              let eex: ExtensaoEndereco = new ExtensaoEndereco();
    
              if(this.objetoAtualiza.cadastroUnico.listaEndereco[i].correio != null) {
                eex.logradouro = this.objetoAtualiza.cadastroUnico.listaEndereco[i].correio.logradouro;
                eex.bairro = this.objetoAtualiza.cadastroUnico.listaEndereco[i].correio.bairro;
                eex.localidade = this.objetoAtualiza.cadastroUnico.listaEndereco[i].correio.localidade;
                eex.uf = this.objetoAtualiza.cadastroUnico.listaEndereco[i].correio.uf;
              } else {
                eex.logradouro = this.objetoAtualiza.cadastroUnico.listaEndereco[i].extensaoEndereco.logradouro;
                eex.bairro = this.objetoAtualiza.cadastroUnico.listaEndereco[i].extensaoEndereco.bairro;
                eex.localidade = this.objetoAtualiza.cadastroUnico.listaEndereco[i].extensaoEndereco.localidade;
                eex.uf = this.objetoAtualiza.cadastroUnico.listaEndereco[i].extensaoEndereco.uf;
              }
    
              this.objetoAtualiza.cadastroUnico.listaEndereco[i].extensaoEndereco = eex;
              this.listaEndereco.push(this.objetoAtualiza.cadastroUnico.listaEndereco[i]);
    
            }
          }
    
          // populando telefone
          this.listaTelefonePf = [];
          if(typeof this.objetoAtualiza.cadastroUnico.pessoaFisica.listaTelefone !== 'undefined') {
            for(let i = 0; i < this.objetoAtualiza.cadastroUnico.pessoaFisica.listaTelefone.length; i++) {
              this.listaTelefonePf.push(this.objetoAtualiza.cadastroUnico.pessoaFisica.listaTelefone[i]);
            }
          }
        //}

       } , err => {
         this.mensagem.tratarErro(err);
       });
    } else {
      this.objetoAtualiza = new Trabalhador();
      this.iniciarPaginaInserir();
      this.listaTrabalhadorDeficiencia = [];
      this.listaTrabalhadorCbo = [];
      this.listaEndereco = [];
      this.listaTelefonePf = [];
      this.objetoAtualiza.cadastroUnico.cpf = event.cpf;
    }

  }

  iniciarPaginaAlterar() {

    this.objetoAtualiza.cadastroUnico = new CadastroUnico();
    this.objetoAtualiza.cadastroUnico.pessoaJuridica = new PessoaJuridica();
    this.objetoAtualiza.cadastroUnico.pessoaFisica = new PessoaFisica();
    this.endereco = new Endereco();
    this.endereco.extensaoEndereco = new ExtensaoEndereco();
    //this.contato = new Contato();

    let trabalhador: Trabalhador = new Trabalhador();
    trabalhador.codigo = +this.codigo;

    // GET TRABALHADOR COM O CODIGO
    this.service.get(trabalhador).subscribe((responseApi:ResponseApi) => {

      this.objetoAtualiza = responseApi.data;
      
      this.listaTrabalhadorCbo = [];
      if(typeof this.objetoAtualiza.listaTrabalhadorCbo !== 'undefined') {
        for(let i = 0; i < this.objetoAtualiza.listaTrabalhadorCbo.length; i++) {
          //console.log(this.objetoAtualiza);
          this.objetoAtualiza.listaTrabalhadorCbo[i].descricaoCbo = this.objetoAtualiza.listaTrabalhadorCbo[i].cbo.nome;
          this.listaTrabalhadorCbo.push(this.objetoAtualiza.listaTrabalhadorCbo[i]);
        }
      }

      this.listaTrabalhadorDeficiencia = [];
      if(typeof this.objetoAtualiza.listaTrabalhadorDeficiencia !== 'undefined') {
        for(let i = 0; i < this.objetoAtualiza.listaTrabalhadorDeficiencia.length; i++) {
          this.listaTrabalhadorDeficiencia.push(this.objetoAtualiza.listaTrabalhadorDeficiencia[i]);
        }
      }

      this.listaEndereco = [];
      for(let i = 0; i < this.objetoAtualiza.cadastroUnico.listaEndereco.length; i++) {

        let eex: ExtensaoEndereco = new ExtensaoEndereco();

        if(this.objetoAtualiza.cadastroUnico.listaEndereco[i].correio != null) {
          eex.logradouro = this.objetoAtualiza.cadastroUnico.listaEndereco[i].correio.logradouro;
          eex.bairro = this.objetoAtualiza.cadastroUnico.listaEndereco[i].correio.bairro;
          eex.localidade = this.objetoAtualiza.cadastroUnico.listaEndereco[i].correio.localidade;
          eex.uf = this.objetoAtualiza.cadastroUnico.listaEndereco[i].correio.uf;
        } else {
          eex.logradouro = this.objetoAtualiza.cadastroUnico.listaEndereco[i].extensaoEndereco.logradouro;
          eex.bairro = this.objetoAtualiza.cadastroUnico.listaEndereco[i].extensaoEndereco.bairro;
          eex.localidade = this.objetoAtualiza.cadastroUnico.listaEndereco[i].extensaoEndereco.localidade;
          eex.uf = this.objetoAtualiza.cadastroUnico.listaEndereco[i].extensaoEndereco.uf;
        }

        this.objetoAtualiza.cadastroUnico.listaEndereco[i].extensaoEndereco = eex;
        this.listaEndereco.push(this.objetoAtualiza.cadastroUnico.listaEndereco[i]);
      }

      this.objetoAtualiza.dataEmissaoCtps = new Date(this.objetoAtualiza.dataEmissaoCtps);
      this.objetoAtualiza.cadastroUnico.pessoaFisica.dataEmissaoRg = new Date(this.objetoAtualiza.cadastroUnico.pessoaFisica.dataEmissaoRg);
      this.objetoAtualiza.cadastroUnico.pessoaFisica.dataNascimento = new Date(this.objetoAtualiza.cadastroUnico.pessoaFisica.dataNascimento);

      this.listaTelefonePf = [];
      if(typeof this.objetoAtualiza.cadastroUnico.pessoaFisica.listaTelefone !== 'undefined') {
        for(let i = 0; i < this.objetoAtualiza.cadastroUnico.pessoaFisica.listaTelefone.length; i++) {
          this.listaTelefonePf.push(this.objetoAtualiza.cadastroUnico.pessoaFisica.listaTelefone[i]);
        }
      }
      
    } , err => {
      this.mensagem.tratarErro(err);  
    });
  }

  popularCbo() {
    this.trabalhadorCbo = new TrabalhadorCbo();
    let cbo = new Cbo();

    this.cboService.pesquisar(cbo)
                .subscribe((responseApi:ResponseApi) => {
      this.listaCbo = responseApi['data'];
      //this.trabalhadorCbo.cbo = null;
    } , err => {
      this.mensagem.tratarErro(err);
    });
  }

  popularDeficiencia() {
    this.trabalhadorDeficiencia = new TrabalhadorDeficiencia();
    let dominio: Dominio = new Dominio();
    dominio.nomeCampo = 'CD_DEF';

    this.dominioService.pesquisar(dominio)
                .subscribe((responseApi:ResponseApi) => {
      this.listaDeficiencia = responseApi['data'];
      this.trabalhadorDeficiencia.objDeficiencia = null;
    } , err => {
      this.mensagem.tratarErro(err);
    });
  }

  popularTipoTelefone() {
    this.telefonePf = new Telefone();

    let dominio: Dominio = new Dominio();
    dominio.nomeCampo = 'TP_TLF';

    this.dominioService.pesquisar(dominio)
                .subscribe((responseApi:ResponseApi) => {
      this.listaTipoTelefone = responseApi['data'];
      this.telefonePf.objTipo = this.listaTipoTelefone[0];
    } , err => {
      this.mensagem.tratarErro(err);
    });
  }

  popularEstadoCivil() {
    let dominio: Dominio = new Dominio();
    dominio.nomeCampo = 'CD_EST_CIVIL_CPF';

    this.dominioService.pesquisar(dominio)
                .subscribe((responseApi:ResponseApi) => {
      this.listaEstadoCivil = responseApi['data'];
    } , err => {
      this.mensagem.tratarErro(err);
    });
  }

  popularTipoEndereco() {
    let dominio: Dominio = new Dominio();
    dominio.nomeCampo = 'TP_EDR';

    this.dominioService.pesquisar(dominio)
                .subscribe((responseApi:ResponseApi) => {
      this.listaTipoEndereco = responseApi['data'];
      this.endereco.objTipo = this.listaTipoEndereco[0]; 
    } , err => {
      this.mensagem.tratarErro(err);
    });
  }



  pesquisarCep() {
    if(this.endereco.cepFormatado != null
        && this.endereco.cepFormatado != '') {
      let correio: Correio = new Correio();
      correio.cep = Number(this.endereco.cepFormatado);

      this.correioService.get(correio)
                  .subscribe((responseApi:ResponseApi) => {
        let correio: Correio = new Correio();
        correio = responseApi['data'];
        
        this.endereco.extensaoEndereco = new ExtensaoEndereco();
        
        if(correio != null) {
          this.endereco.extensaoEndereco.logradouro = correio.logradouro;
          this.endereco.extensaoEndereco.bairro = correio.bairro;
          this.endereco.extensaoEndereco.localidade = correio.localidade;
          this.endereco.extensaoEndereco.uf = correio.uf;

          this.endereco.extensaoEndereco.logradouro == "" ? this.isLogradouroReadOnly = false : this.isLogradouroReadOnly = true;
          this.endereco.extensaoEndereco.bairro == "" ? this.isBairroReadOnly = false : this.isBairroReadOnly = true;
          this.endereco.extensaoEndereco.localidade == "" ? this.isLocalidadeReadOnly = false : this.isLocalidadeReadOnly = true;
          this.endereco.extensaoEndereco.uf == "" ? this.isUfReadOnly = false : this.isUfReadOnly = true;

        } else {
          this.endereco.extensaoEndereco.logradouro = null;
          this.endereco.extensaoEndereco.bairro = null;
          this.endereco.extensaoEndereco.localidade = null;
          this.endereco.extensaoEndereco.uf = 'AC';

          this.isLogradouroReadOnly = false;
          this.isBairroReadOnly = false;
          this.isLocalidadeReadOnly = false;
          this.isUfReadOnly = false;
        }
      } , err => {
        this.mensagem.tratarErro(err);
      });
    } else {
      this.endereco.extensaoEndereco.logradouro = null;
        this.endereco.extensaoEndereco.bairro = null;
        this.endereco.extensaoEndereco.localidade = null;
        this.endereco.extensaoEndereco.uf = "AC";

        this.isLogradouroReadOnly = false;
        this.isBairroReadOnly = false;
        this.isLocalidadeReadOnly = false;
        this.isUfReadOnly = false;
    }
  }

  adicionarEndereco() {
    if(this.validarEndereco()) {
      
      let enderecoAdicionar: Endereco = new Endereco();
      enderecoAdicionar.extensaoEndereco = new ExtensaoEndereco();

      enderecoAdicionar.tipo = this.endereco.objTipo.valorCampo;
      enderecoAdicionar.descricaoTipo = this.endereco.objTipo.nomeValor;
      enderecoAdicionar.cepFormatado = this.endereco.cepFormatado;
      enderecoAdicionar.cep = Number(this.endereco.cepFormatado);
      enderecoAdicionar.extensaoEndereco.logradouro = this.endereco.extensaoEndereco.logradouro;
      enderecoAdicionar.numero = this.endereco.numero;
      enderecoAdicionar.complemento = this.endereco.complemento;
      enderecoAdicionar.pontoReferencia = this.endereco.pontoReferencia;
      enderecoAdicionar.extensaoEndereco.bairro = this.endereco.extensaoEndereco.bairro;
      enderecoAdicionar.extensaoEndereco.localidade = this.endereco.extensaoEndereco.localidade;
      enderecoAdicionar.extensaoEndereco.uf = this.endereco.extensaoEndereco.uf;
      enderecoAdicionar.flagAtivo = 'S';
      enderecoAdicionar.auditoria = new Auditoria();
      enderecoAdicionar.auditoria.codigoUsuarioInclusao = this.getCodigoUsuarioLogado();
      enderecoAdicionar.auditoria.dataInclusao = new Date();

      this.listaEndereco.push(enderecoAdicionar);
      this.resetEndereco();

    }
  }

  adicionarTelefonePf() {

    if(this.validarTelefonePf()) {
      let telefoneAdicionar: Telefone = new Telefone();

      telefoneAdicionar.descricaoTipo = this.telefonePf.objTipo.nomeValor;
      telefoneAdicionar.tipo = this.telefonePf.objTipo.valorCampo;
      telefoneAdicionar.ddd = Number(this.telefonePf.nrTelefoneExtenso.substring(0,2));
      telefoneAdicionar.numero = Number(this.telefonePf.nrTelefoneExtenso.substring(2,this.telefonePf.nrTelefoneExtenso.length));
      telefoneAdicionar.auditoria = new Auditoria();
      telefoneAdicionar.auditoria.dataInclusao = new Date();
      telefoneAdicionar.auditoria.codigoUsuarioInclusao = this.getCodigoUsuarioLogado();
      telefoneAdicionar.flagAtivo = 'S';
      telefoneAdicionar.flagWhats = (typeof this.telefonePf.flagWhats !== 'undefined') ? true : false ;

      this.listaTelefonePf.push(telefoneAdicionar);
      this.resetTelefonePf();
    }

  }

  adicionarCbo() {

    if(typeof this.trabalhadorCbo.cbo.codigo === 'undefined' || this.trabalhadorCbo.cbo.codigo === null) {
      this.mensagem.tratarErroPersonalizado("", "Selecione o CBO antes de adicionar.");
      return false;
    }

    //VERIFICANDO SE O ITEM JA FOI ADICIONADO
    if(this.listaTrabalhadorCbo != null
      && this.listaTrabalhadorCbo.length > 0) {
     for(let i = 0; i < this.listaTrabalhadorCbo.length; i++) {
       if(this.trabalhadorCbo.cbo.codigo === this.listaTrabalhadorCbo[i].codigoCbo) {
         this.mensagem.tratarErroPersonalizado("","Este item já foi adicionado.");
         return false;
       }
     }
   }

    let trabalhadorCbo: TrabalhadorCbo = new TrabalhadorCbo();

    trabalhadorCbo.nome = this.trabalhadorCbo.nome;
    trabalhadorCbo.codigoCbo = this.trabalhadorCbo.cbo.codigo;
    trabalhadorCbo.descricaoCbo = this.trabalhadorCbo.cbo.nome;

    this.listaTrabalhadorCbo.push(trabalhadorCbo);
    this.resetTrabalhadorCbo();

  }

  adicionarDeficiencia() {

    if(this.trabalhadorDeficiencia.objDeficiencia === null) {
      this.mensagem.tratarErroPersonalizado("", "Selecione a Deficiência antes de adicionar.");
      return false;
    }

    let trabalhadorDeficiencia: TrabalhadorDeficiencia = new TrabalhadorDeficiencia();

    trabalhadorDeficiencia.nome = this.trabalhadorDeficiencia.nome;
    trabalhadorDeficiencia.codigoDeficiencia = this.trabalhadorDeficiencia.objDeficiencia.valorCampo;
    trabalhadorDeficiencia.descricaoDeficiencia = this.trabalhadorDeficiencia.objDeficiencia.nomeValor;

    this.listaTrabalhadorDeficiencia.push(trabalhadorDeficiencia);
    this.resetTrabalhadorDeficiencia();

  }

  resetTrabalhadorDeficiencia() {
    this.trabalhadorDeficiencia = new TrabalhadorDeficiencia();
    this.trabalhadorDeficiencia.objDeficiencia = null;
  }

  resetTrabalhadorCbo() {
    this.trabalhadorCbo = new TrabalhadorCbo();
    this.trabalhadorCbo.cbo = new Cbo();
  }

  resetTelefonePf() {
    this.telefonePf = new Telefone();
    this.telefonePf.objTipo = this.listaTipoTelefone[0];
  }

  resetEndereco() {
    this.endereco = new Endereco();
    this.endereco.extensaoEndereco = new ExtensaoEndereco();
    this.endereco.extensaoEndereco.uf = 'AC';
    this.endereco.objTipo = this.listaTipoEndereco[0];
  }

  excluirEndereco(index) {
    this.listaEndereco.splice(index,1);
  }

  excluirTelefonePf(index) {
    this.listaTelefonePf.splice(index,1);
  }

  excluirTrabalhadorCbo(index) {
    this.listaTrabalhadorCbo.splice(index, 1);
  }

  excluirTrabalhadorDeficiencia(index) {
    this.listaTrabalhadorDeficiencia.splice(index, 1);
  }

  completarInserir() {

    if(this.objetoAtualiza.cadastroUnico.tipoPessoa == "F") {
      this.objetoAtualiza.cadastroUnico.cpfCnpj = Number(this.objetoAtualiza.cadastroUnico.cpf);
      this.objetoAtualiza.cadastroUnico.pessoaFisica.listaTelefone = this.listaTelefonePf;
    }

    //ENDERECO
    this.objetoAtualiza.cadastroUnico.listaEndereco = [];
    for(let i = 0; i < this.listaEndereco.length; i++) {
      this.objetoAtualiza.cadastroUnico.listaEndereco.push(this.listaEndereco[i]);
    }

    //CBO
    this.objetoAtualiza.listaTrabalhadorCbo = [];
    for(let i = 0; i < this.listaTrabalhadorCbo.length; i++) {
      this.objetoAtualiza.listaTrabalhadorCbo.push(this.listaTrabalhadorCbo[i]);
    }

    //DEFICIENCIA
    this.objetoAtualiza.listaTrabalhadorDeficiencia = [];
    if(typeof this.listaTrabalhadorDeficiencia !== "undefined" && this.listaTrabalhadorDeficiencia.length > 0) {
      for(let i = 0; i < this.listaTrabalhadorDeficiencia.length; i++) {
        this.objetoAtualiza.listaTrabalhadorDeficiencia.push(this.listaTrabalhadorDeficiencia[i]);
      }
    }

    //AGENDA
    this.objetoAtualiza.listaAgendaTrabalhador = [];
    if(typeof this.listaAgendaTrabalhador !== "undefined" && this.listaAgendaTrabalhador.length > 0) {
      for(let i = 0; i < this.listaAgendaTrabalhador.length; i++) {
        if(this.listaAgendaTrabalhador[i].fgChecked)
        this.objetoAtualiza.listaAgendaTrabalhador.push(this.listaAgendaTrabalhador[i]);
      }

      this.objetoAtualiza.listaAgendaTrabalhador.forEach(value => {console.log(value.nomeDia)});
    }


    //AUDITORIA
    this.objetoAtualiza.situacao = 2;  //ATIVO
    this.objetoAtualiza.situacaoIngresso = 1; //PENDENTE DE AVALIACAO
    this.objetoAtualiza.auditoria = new Auditoria();
    this.objetoAtualiza.auditoria.dataInclusao = new Date();
    this.objetoAtualiza.auditoria.codigoUsuarioInclusao = this.getCodigoUsuarioLogado();

    //AUDITORIA CUN
    this.objetoAtualiza.cadastroUnico.auditoria = new Auditoria();
    this.objetoAtualiza.cadastroUnico.auditoria.dataInclusao = new Date();
    this.objetoAtualiza.cadastroUnico.auditoria.codigoUsuarioInclusao = this.getCodigoUsuarioLogado();

    if(this.objetoAtualiza.cadastroUnico !== null
      && this.objetoAtualiza.cadastroUnico.codigo !== null && typeof this.objetoAtualiza.cadastroUnico.codigo !== 'undefined') {
        this.objetoAtualiza.cadastroUnico.auditoria.dataAlteracao = new Date();
        this.objetoAtualiza.cadastroUnico.auditoria.codigoUsuarioAlteracao = this.getCodigoUsuarioLogado();
    }

  }

  completarAlterar() {

    if(this.objetoAtualiza.cadastroUnico.tipoPessoa == "F") {
      this.objetoAtualiza.cadastroUnico.cpfCnpj = Number(this.objetoAtualiza.cadastroUnico.cpf);
      this.objetoAtualiza.cadastroUnico.pessoaFisica.listaTelefone = this.listaTelefonePf;
    }

    //CBO
    this.objetoAtualiza.listaTrabalhadorCbo = [];
    for(let i = 0; i < this.listaTrabalhadorCbo.length; i++) {
      this.objetoAtualiza.listaTrabalhadorCbo.push(this.listaTrabalhadorCbo[i]);
    }

    //DEFICIENCIA
    this.objetoAtualiza.listaTrabalhadorDeficiencia = [];
    if(typeof this.listaTrabalhadorDeficiencia !== "undefined" && this.listaTrabalhadorDeficiencia.length > 0) {
      for(let i = 0; i < this.listaTrabalhadorDeficiencia.length; i++) {
        this.objetoAtualiza.listaTrabalhadorDeficiencia.push(this.listaTrabalhadorDeficiencia[i]);
      }
    }

    //ENDERECO
    this.objetoAtualiza.cadastroUnico.listaEndereco = [];
    for(let i = 0; i < this.listaEndereco.length; i++) {
      this.objetoAtualiza.cadastroUnico.listaEndereco.push(this.listaEndereco[i]);
    }

    //AUDITORIA
    this.objetoAtualiza.auditoria = new Auditoria();
    this.objetoAtualiza.auditoria.dataAlteracao = new Date();
    this.objetoAtualiza.auditoria.codigoUsuarioAlteracao = this.getCodigoUsuarioLogado();

    //AUDITORIA CUN
    this.objetoAtualiza.cadastroUnico.auditoria = new Auditoria();
    this.objetoAtualiza.cadastroUnico.auditoria.dataAlteracao = new Date();
    this.objetoAtualiza.cadastroUnico.auditoria.codigoUsuarioAlteracao = this.getCodigoUsuarioLogado();

    //AUDITORIA TELEFONE PF
    for(let i = 0; i < this.objetoAtualiza.cadastroUnico.pessoaFisica.listaTelefone.length; i++) {
      this.objetoAtualiza.cadastroUnico.pessoaFisica.listaTelefone[i].auditoria = new Auditoria();
      this.objetoAtualiza.cadastroUnico.pessoaFisica.listaTelefone[i].auditoria.codigoUsuarioAlteracao = this.getCodigoUsuarioLogado();
      this.objetoAtualiza.cadastroUnico.pessoaFisica.listaTelefone[i].auditoria.dataAlteracao = new Date();
    }

  }

  completarPosInserir() {
    this.router.navigate(['trabalhador-pesquisar']);
  }

  completarPosAlterar() {
    this.router.navigate(['trabalhador-pesquisar']);
  }

  validarTelefonePf() {
    if((typeof this.telefonePf.nrTelefoneExtenso === "undefined") 
            || this.telefonePf.nrTelefoneExtenso === ''
            || Number(this.telefonePf.nrTelefoneExtenso.length) < 11) {
      this.mensagem.tratarErroPersonalizado("", "Informe um telefone com no mínimo 11 dígitos.");
      return false;
    }

    return true;
  }

  validarInserir() {

    //VALIDACAO DE CAMPOS OBRIGATORIOS PF
    if(this.objetoAtualiza.cadastroUnico.cpf == null || this.objetoAtualiza.cadastroUnico.cpf == '') {
      this.mensagem.tratarErroPersonalizado("", "O campo CPF é obrigatório.");
      return false;
    }

    if(this.objetoAtualiza.cadastroUnico.pessoaFisica.registroGeral == null || this.objetoAtualiza.cadastroUnico.pessoaFisica.registroGeral <= 0) {
      this.mensagem.tratarErroPersonalizado("", "O campo RG é obrigatório.");
      return false;
    }

    if(this.objetoAtualiza.cadastroUnico.pessoaFisica.dataEmissaoRg == null || (typeof this.objetoAtualiza.cadastroUnico.pessoaFisica.dataEmissaoRg == 'undefined')) {
      this.mensagem.tratarErroPersonalizado("", "O campo Data de Expedição é obrigatório.");
      return false;
    }

    if(this.objetoAtualiza.cadastroUnico.pessoaFisica.orgaoEmissorRg == null || this.objetoAtualiza.cadastroUnico.pessoaFisica.orgaoEmissorRg == '') {
      this.mensagem.tratarErroPersonalizado("", "O campo Org. Emissor é obrigatório.");
      return false;
    }

    if(this.objetoAtualiza.cadastroUnico.nome == null || this.objetoAtualiza.cadastroUnico.nome == '') {
      this.mensagem.tratarErroPersonalizado("", "O campo Nome é obrigatório.");
      return false;
    }

    if(this.objetoAtualiza.cadastroUnico.pessoaFisica.nomeMae == null || this.objetoAtualiza.cadastroUnico.pessoaFisica.nomeMae == '') {
      this.mensagem.tratarErroPersonalizado("", "O campo Nome da Mãe é obrigatório.");
      return false;
    }

    if(this.objetoAtualiza.cadastroUnico.email == null || this.objetoAtualiza.cadastroUnico.email == '') {
      this.mensagem.tratarErroPersonalizado("", "O campo E-mail é obrigatório.");
      return false;
    }

    if(this.objetoAtualiza.cadastroUnico.pessoaFisica.dataNascimento == null || typeof this.objetoAtualiza.cadastroUnico.pessoaFisica.dataNascimento === 'undefined') {
      this.mensagem.tratarErroPersonalizado("", "O campo Data de Nascimento é obrigatório.");
      return false;
    }

    if(this.objetoAtualiza.numeroPis == null || typeof this.objetoAtualiza.numeroPis === 'undefined') {
      this.mensagem.tratarErroPersonalizado("", "O campo PISS é obrigatório.");
      return false;
    }

    if(this.objetoAtualiza.numeroCtps == null || typeof this.objetoAtualiza.numeroCtps === 'undefined') {
      this.mensagem.tratarErroPersonalizado("", "O campo CTPS é obrigatório.");
      return false;
    }

    if(this.objetoAtualiza.numeroSerieCtps == null || typeof this.objetoAtualiza.numeroSerieCtps === 'undefined') {
      this.mensagem.tratarErroPersonalizado("", "O campo Série é obrigatório.");
      return false;
    }

    if(this.objetoAtualiza.dataEmissaoCtps == null || typeof this.objetoAtualiza.dataEmissaoCtps === 'undefined') {
      this.mensagem.tratarErroPersonalizado("", "O campo Data de Emissão CTPS é obrigatório.");
      return false;
    }

    //PELO MENOS UM CBO OBRIGATORIO
    if(this.listaTrabalhadorCbo == null || this.listaTrabalhadorCbo.length <= 0) {
      this.mensagem.tratarErroPersonalizado("", "Pelo menos um CBO deve ser adicionado.");
      return false;
    }

    //PELO MENOS UM ENDERECO OBRIGATORIO
    if(this.listaEndereco == null || this.listaEndereco.length <= 0) {
      this.mensagem.tratarErroPersonalizado("", "Pelo menos um Endereço deve ser adicionado.");
      return false;
    }

    //PELO MENOS UM CONTATO OBRIGATORIO (PF)
    if(this.listaTelefonePf == null || this.listaTelefonePf.length <= 0) {
      this.mensagem.tratarErroPersonalizado("", "Pelo menos um Telefone deve ser adicionado.");
      return false;
    }

    return true;
  }

  validarEndereco() {
    if(this.endereco.objTipo == null || this.endereco.objTipo.valorCampo <= 0) {
      this.mensagem.tratarErroPersonalizado("", "O campo Tipo de Endereço é obrigatório.");
      return false;
    }

    if(this.endereco.cepFormatado == null || this.endereco.cepFormatado == '') {
      this.mensagem.tratarErroPersonalizado("", "O campo CEP é obrigatório.");
      return false;
    }

    if(this.endereco.extensaoEndereco.logradouro == null || this.endereco.extensaoEndereco.logradouro == '') {
      this.mensagem.tratarErroPersonalizado("", "O campo Logradouro é obrigatório.");
      return false;
    }

    if(this.endereco.numero == null || this.endereco.numero == '') {
      this.mensagem.tratarErroPersonalizado("", "O campo Número é obrigatório.");
      return false;
    }

    if(this.endereco.extensaoEndereco.bairro == null || this.endereco.extensaoEndereco.bairro == '') {
      this.mensagem.tratarErroPersonalizado("", "O campo Bairro é obrigatório.");
      return false;
    }

    return true;
  }
  
  voltar() {
    this.back('trabalhador-pesquisar');
  }

  validarAlterar() {
    return this.validarInserir();
  }

  setDia($event, i) {
   this.listaAgendaTrabalhador[i].nomeDia = $event.target.value;
  }

  replicarHorario(i) {
    this.listaAgendaTrabalhador.forEach((element, index) => {
      if(index!=i){
        element.nrHor1=this.listaAgendaTrabalhador[i].nrHor1;
        element.nrHor2=this.listaAgendaTrabalhador[i].nrHor2;
        element.nrHor3=this.listaAgendaTrabalhador[i].nrHor3;
        element.nrHor4=this.listaAgendaTrabalhador[i].nrHor4;
      }
    })
  }

  limparAllHorario() {

    this.listaAgendaTrabalhador.forEach(element => {
      element.nrHor1=null;
      element.nrHor2=null;
      element.nrHor3=null;
      element.nrHor4=null;
    })

  }

  limparHorario(i) {

    this.listaAgendaTrabalhador[i].nrHor1=null;
    this.listaAgendaTrabalhador[i].nrHor2=null;
    this.listaAgendaTrabalhador[i].nrHor3=null;
    this.listaAgendaTrabalhador[i].nrHor4=null;

  }
}
