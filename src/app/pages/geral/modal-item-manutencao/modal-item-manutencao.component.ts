import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AptareCrudController } from '../../../components/shared/crud/aptare-crud-controller';
import { Espaco } from '../../../model/espaco/espaco';
import { EspacoItemEspaco } from '../../../model/espaco/espaco-item-espaco';
import { ResponseApi } from '../../../model/response-api';
import { EspacoService } from '../../../services/espaco/espaco.service';
import { MensagemService } from '../../../services/shared/mensagem.service';
import { DialogService } from 'src/app/services/shared/dialog.service';
import { CadastroUnicoService } from 'src/app/services/cadastro-unico/cadastro-unico.service';

@Component({
  selector: 'app-modal-item-manutencao',
  templateUrl: './modal-item-manutencao.component.html',
  styleUrls: ['./modal-item-manutencao.component.css']
})
export class ModalItemManutencaoComponent extends AptareCrudController<Espaco, {new(): Espaco}>{

  constructor(router: Router,
              route: ActivatedRoute,             
              public service: EspacoService,
              dialog: MatDialog,
              public dialogRef: MatDialogRef<ModalItemManutencaoComponent>,
              @Inject(MAT_DIALOG_DATA) private data: any,
              mensagem: MensagemService,
              dialogService: DialogService) {
    super(router, route, dialog, Espaco, service, mensagem, dialogService);   
  }

  ngOnInit() {
    super.ngOnInit();

    let espaco = new Espaco();
    espaco.codigo = this.data.codigo;

    this.service.get(espaco)
                .subscribe((responseApi:ResponseApi) => {
      this.objetoAtualiza = responseApi['data']; 

    } , err => {
      this.mensagem.tratarErro(err);
    });
  }

  salvar() {

    this.dialogService.openConfirmDialog('Deseja realmente atualizar os itens?')
    .afterClosed().subscribe(res =>{
      if(res){
        let flag: boolean = true;

        this.objetoAtualiza.listaEspacoItemEspaco.forEach(element => {

          let qtdAtivos = element.quantidadeAtivos;
          let qtdManut = element.quantidadeManutencao;
          let total = element.totalItens;

          if(parseInt(qtdAtivos.toString()) + parseInt(qtdManut.toString()) !== parseInt(total.toString())) {
            flag = false;
          }
          
        });

        // Salvando alterações
        if(flag) {
          this.service.salvarManutencao(this.objetoAtualiza).subscribe((responseApi:ResponseApi) => {
            this.mensagem.msgSucesso('O registro foi inserido com sucesso.');
            this.fechar();
          } , err => {
            this.mensagem.tratarErro(err);
          });
        } else {
          this.mensagem.tratarErroPersonalizado("", "O valor total do item deve ser igual ao somatório dos itens ativos com os itens inativos.");
          return false;
        }
      }
    });

  }

  fechar() {
    this.dialogRef.close(this.objetoAtualiza);
  }

}
