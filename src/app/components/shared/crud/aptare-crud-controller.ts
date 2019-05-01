import { UtilService } from './../../../services/util.service';
import { AptareCrudService } from './../../../services/shared/aptare-crud.service';
import { OnInit, AfterViewInit, AfterContentInit, OnDestroy, AfterViewChecked, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { ResponseApi } from '../../../model/response-api';
import { MensagemService } from '../../../services/shared/mensagem.service';
import { MatDialog } from '@angular/material';
import { AptareUtilController } from '../util/aptare-util-controller';
import { IMyDrpOptions } from 'mydaterangepicker';
import { DialogService } from '../../../services/shared/dialog.service';
import { CadastroUnico } from 'src/app/model/cadastro-unico/cadastro-unico';
import { PessoaFisica } from 'src/app/model/cadastro-unico/pessoa-fisica';
import { CadastroUnicoService } from 'src/app/services/cadastro-unico/cadastro-unico.service';

export class AptareCrudController <Entity, 
                                  CT extends { new(itemEntity?: any): Entity },>
                                  extends AptareUtilController  
                                  implements OnInit {

  listaResultado: Entity[];
  objetoAtualiza: Entity;
  objetoPesquisa: Entity; 
  
  classCss : {};

  codigo: string;
  fgVoltar: string;

  util: UtilService;

  listaUf = [];
  listaDIAS=[];

  cadastroUnico: CadastroUnico;
            
  constructor(public router: Router, 
              public route: ActivatedRoute,          
              public dialog: MatDialog,
              public typeEntity: CT, 
              public service: AptareCrudService<Entity>,
              public mensagem: MensagemService,
              public dialogService: DialogService) {
                 super(null,router);
              }            

  ngOnInit(): void {
    this.util = UtilService.getInstance();
    this.objetoAtualiza = this.getNewEntityInstance();
    this.objetoPesquisa = this.getNewEntityInstance();    
    this.listaResultado = null;
    
    this.setListasStaticas();

    this.codigo = this.route.snapshot.params['id'];

    if(this.codigo == undefined) {
       this.iniciarPaginaInserir();
       this.iniciarPaginaPesquisar();
       this.preencherFiltros();
    } else {
       this.iniciarPaginaAlterar();
    }

  }

  pesquisar() {    
    if(!this.validaPesquisar()){
      this.listaResultado = [];
      return;
    }
    
    this.completarPesquisar();
    this.service.pesquisar(this.objetoPesquisa)
                          .subscribe((responseApi:ResponseApi) => {
      this.listaResultado = responseApi['data'];
    } , err => {
      this.mensagem.tratarErro(err);
    });
  }

  get(obj) {
    this.service.get(obj).subscribe((responseApi:ResponseApi) => {        
      responseApi.data = this.executarPosGet(responseApi.data);
      this.objetoAtualiza = responseApi.data;
    } , err => {
      this.mensagem.tratarErro(err);  
    });

  }

  completarPesquisar() {}

  inserir() {    
    if(this.validarInserir()) {
      this.completarInserir();
      //console.log(this.objetoAtualiza);
      this.service.inserir(this.objetoAtualiza).subscribe((responseApi:ResponseApi) => {
        //RETORNO DO OBJETO PERSISTIDO
        let objeto : Entity = responseApi.data;
        this.objetoAtualiza = objeto;
        this.completarPosInserir();
        this.mensagem.msgSucesso('O registro foi inserido com sucesso.');
        
        // this.spinnerService.hide();
      } , err => {
        this.mensagem.tratarErro(err);
      });
    }
  }

  validarInserir():boolean{ return true }
  completarInserir() {}
  completarPosInserir() {}

  alterar() {
    if(this.validarAlterar()) {
      this.completarAlterar();
      this.service.alterar(this.objetoAtualiza).subscribe((responseApi:ResponseApi) => {
        //RETORNO DO OBJETO PERSISTIDO
        let objeto : Entity = responseApi.data;
              
        this.completarPosAlterar();
        this.mensagem.msgSucesso('O registro foi alterado com sucesso.');
        
        // this.spinnerService.hide();
      } , err => {
        this.mensagem.tratarErro(err);
      });
    }
  } 

  validarAlterar():boolean{ return true }
  completarAlterar() {}
  completarPosAlterar() {}

  inativar(obj: Entity){
    this.dialogService.openConfirmDialog('Deseja realmente inativar este registro?')
      .afterClosed().subscribe(res =>{
        if(res){
          this.service.inativar(obj).subscribe((responseApi:ResponseApi) => {
              this.mensagem.msgSucesso('O registro foi inativado com sucesso.');
              this.statusInativar(obj);
          } , err => {
            this.mensagem.tratarErro(err);
          });
                    
        } 
      });
  }

  ativar(obj: Entity){
    this.dialogService.openConfirmDialog('Deseja realmente ativar este registro?')
    .afterClosed().subscribe(res =>{
      if(res){
        this.service.ativar(obj).subscribe((responseApi:ResponseApi) => {
          this.mensagem.msgSucesso('O registro foi ativado com sucesso.');
          this.statusAtivar(obj);
        } , err => {
          this.mensagem.tratarErro(err);
        });
      }
    });
  }

  getNewEntityInstance(itemEntity?: any): Entity {    
    return new this.typeEntity(itemEntity);
  }

  abrirModal(component, config) {
    this.dialog.open(component, config);
  }

  id<T>(x: T) { return x; }

  back(url) {

    let navigationExtras: NavigationExtras = {
      queryParams: {
          "back": "T"
      }
    };

    this.router.navigate([url], navigationExtras);
  }

  editar(url, id) {
    localStorage.setItem("objFiltro", JSON.stringify(this.objetoPesquisa));
    this.router.navigate([url,id]);
  }

  logout() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    this.router.navigate(['/login']);
  }

  protected executarPosGet(obj){ return obj }
  protected setListaPesquisar(){}
  protected iniciarPaginaInserir() {}  
  protected iniciarPaginaAlterar() {}  
  protected statusInativar(obj: Entity) {}
  protected statusAtivar(obj: Entity) {}
  protected validaPesquisar(): boolean{ return true }
  protected iniciarPaginaPesquisar() {}

  preencherFiltros() {
    this.route.queryParams.subscribe(params => {
      
      let back = params['back'];""
      if(typeof back !== 'undefined' && back == 'T' 
            && localStorage.getItem("objFiltro") != null 
            && typeof localStorage.getItem("objFiltro") !== 'undefined') {
        this.objetoPesquisa = JSON.parse(localStorage.getItem("objFiltro"));
        this.pesquisar();
      } else {
        localStorage.removeItem("objFiltro");
      }
          
    });
  }

  getCodigoUsuarioLogado()
  {
    return this.getUsuarioLogado().codigo;
  }

  getUsuarioLogado()
  {
    return JSON.parse(localStorage.getItem("usuario"));
  }

  myDateRangePickerOptions: IMyDrpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
    firstDayOfWeek: 'su',
    height: '32px',
    editableDateRangeField: false,
    openSelectorOnInputClick: true,
    showClearBtn: true,
    showClearDateRangeBtn: true,
    markCurrentDay: true,
    markCurrentYear: true,
    markCurrentMonth: true,
    monthSelector: true,
    minYear: 2018,
    dayLabels: {su: 'Dom', mo: 'Seg', tu: 'Ter', we: 'Qua', th: 'Qui', fr: 'Sex', sa: 'Sab'},
    monthLabels: { 1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun', 7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez' }
};

  setListasStaticas() {
    if(this.listaUf.length == 0) {
      this.listaUf.push({nome:"AC", valor:"AC"});
      this.listaUf.push({nome:"AL", valor:"AL"});
      this.listaUf.push({nome:"AP", valor:"AP"});
      this.listaUf.push({nome:"AM", valor:"AM"});
      this.listaUf.push({nome:"BA", valor:"BA"});
      this.listaUf.push({nome:"CE", valor:"CE"});
      this.listaUf.push({nome:"DF", valor:"DF"});
      this.listaUf.push({nome:"ES", valor:"ES"});
      this.listaUf.push({nome:"GO", valor:"GO"});
      this.listaUf.push({nome:"MA", valor:"MA"});
      this.listaUf.push({nome:"MT", valor:"MT"});
      this.listaUf.push({nome:"MS", valor:"MS"});
      this.listaUf.push({nome:"MG", valor:"MG"});
      this.listaUf.push({nome:"PA", valor:"PA"});
      this.listaUf.push({nome:"PB", valor:"PB"});
      this.listaUf.push({nome:"PR", valor:"PR"});
      this.listaUf.push({nome:"PE", valor:"PE"});
      this.listaUf.push({nome:"PI", valor:"PI"});
      this.listaUf.push({nome:"RR", valor:"RR"});
      this.listaUf.push({nome:"RO", valor:"RO"});
      this.listaUf.push({nome:"RJ", valor:"RJ"});
      this.listaUf.push({nome:"RN", valor:"RN"});
      this.listaUf.push({nome:"RS", valor:"RS"});
      this.listaUf.push({nome:"SC", valor:"SC"});
      this.listaUf.push({nome:"SP", valor:"SP"});
      this.listaUf.push({nome:"SE", valor:"SE"});
      this.listaUf.push({nome:"TO", valor:"TO"});

    }

    if(this.listaDIAS.length == 0) {
      this.listaDIAS.push({nome: "Domingo", valor: 0});
      this.listaDIAS.push({nome: "Segunda-Feira", valor: 1});
      this.listaDIAS.push({nome: "Terca-Feira", valor: 2});
      this.listaDIAS.push({nome: "Quarta-Feira", valor: 3});
      this.listaDIAS.push({nome: "Quinta-Feira", valor: 4});
      this.listaDIAS.push({nome: "Sexta-Feira", valor: 5});
      this.listaDIAS.push({nome: "Sábado", valor: 6});

    }
  }

  limparCampos() {
    this.dialogService.openConfirmDialog('Você deseja apagar todos os campos preenchidos?')
      .afterClosed().subscribe(res =>{
        if(res){
          this.objetoAtualiza = this.getNewEntityInstance();
          this.setListasStaticas();
          this.iniciarPaginaInserir();
        } 
      });
  }

}
