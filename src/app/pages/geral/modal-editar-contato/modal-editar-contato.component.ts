import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AptareCrudController } from '../../../components/shared/crud/aptare-crud-controller';
import { Cargo } from '../../../model/cadastro-unico/cargo';
import { Contato } from '../../../model/cadastro-unico/contato';
import { Dominio } from '../../../model/geral/dominio';
import { ResponseApi } from '../../../model/response-api';
import { CargoService } from '../../../services/cadastro-unico/cargo.service';
import { ContatoService } from '../../../services/cadastro-unico/contato.service';
import { DominioService } from '../../../services/geral/dominio.service';
import { DialogService } from '../../../services/shared/dialog.service';
import { MensagemService } from '../../../services/shared/mensagem.service';
import { CadastroUnicoService } from 'src/app/services/cadastro-unico/cadastro-unico.service';

@Component({
  selector: 'app-modal-editar-contato',
  templateUrl: './modal-editar-contato.component.html',
  styleUrls: ['./modal-editar-contato.component.css']
})
export class ModalEditarContatoComponent extends AptareCrudController<Contato, {new(): Contato}>{

  listaTipoContato = [];
  listaCargo = [];

  constructor(router: Router, 
              route: ActivatedRoute,             
              service: ContatoService,
              private cargoService: CargoService,
              private dominioService: DominioService,
              dialog: MatDialog,
              public dialogRef: MatDialogRef<ModalEditarContatoComponent>,
              @Inject(MAT_DIALOG_DATA) private data: any,
              mensagem: MensagemService,
              dialogService: DialogService) {
    super(router, route, dialog, Contato, service, mensagem, dialogService);   
  }

  ngOnInit() {

    this.popularTipoContato();
    this.popularCargo();

    this.objetoAtualiza = this.data;
  }

  popularCargo() {
    let cargo: Cargo = new Cargo();
    cargo.flagAtivo = 'S';

    this.cargoService.pesquisar(cargo)
                .subscribe((responseApi:ResponseApi) => {
      this.listaCargo = responseApi['data']; 

      for(let i = 0; i < this.listaCargo.length; i++) {
        if(this.listaCargo[i].codigo === this.objetoAtualiza.codigoCargo) {
          this.objetoAtualiza.cargo = this.listaCargo[i];
        }
      }

    } , err => {
      this.mensagem.tratarErro(err);
    });
  }

  popularTipoContato() {
    let dominio: Dominio = new Dominio();
    dominio.nomeCampo = 'TP_CTT';

    this.dominioService.pesquisar(dominio)
                .subscribe((responseApi:ResponseApi) => {
      this.listaTipoContato = responseApi['data']; 
      
      for(let i = 0; i < this.listaTipoContato.length; i++) {
        if(this.listaTipoContato[i].valorCampo === this.objetoAtualiza.tipoContato) {
          this.objetoAtualiza.objTipoContato = this.listaTipoContato[i];
        }
      }

    } , err => {
      this.mensagem.tratarErro(err);
    });
  }

  editarContato() {
    this.dialogRef.close(this.objetoAtualiza);
  }

  fechar() {
    this.dialogRef.close();
  }

}
