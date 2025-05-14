
import TicketHeader from "@/components/admin/home/ticketHeader";

import {BiCategory} from "react-icons/bi";
import {MdDriveFileRenameOutline} from "react-icons/md";
import {TiWorld} from "react-icons/ti";
import {TbWeight} from "react-icons/tb";
import {GrStatusGood} from "react-icons/gr";
import {AiOutlineGold} from "react-icons/ai";


function DetailProduct({product}) {


    return (
        <div className="flex flex-wrap -mx-3">
            <TicketHeader icon={MdDriveFileRenameOutline} productName="Code" quantity={product?.code ?? "-"}
                          size="w-1/6"/>
            <TicketHeader icon={BiCategory} productName="Modèle" quantity={product?.model ?? "-"} size="w-1/6"/>
            <TicketHeader icon={TiWorld} productName="Provenance" quantity={product?.origin ?? "-"} size="w-1/6"/>
            <TicketHeader icon={AiOutlineGold } productName="Carat" quantity={product?.carat ?? "-"} size="w-1/6"/>
            <TicketHeader icon={TbWeight} productName="Poids" quantity={product?.weight ?? "-"} size="w-1/6"/>
            <TicketHeader
                icon={GrStatusGood}
                productName="État"
                size="w-1/6"
                quantity={
                    product?.status === "Active" ? (
                    "Dans le stock"
                    ) : product?.status === "Lend" ? (
                    "Prêter"
                    ) : product?.status === "Sold" ? (
                   " Vendu"
                    ) : (
                        "-"
                    )
                }
            />
        </div>


    );
}

export default DetailProduct;