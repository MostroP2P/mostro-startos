import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { daemon_settings } from '../fileModels/settings'

export const current = VersionInfo.of({
  version: '0.19.0:0',
  releaseNotes: {
    en_US: `Updated Mostro to 0.19.0.

**Features**
- Protocol v1 (gift-wrap) is removed; the daemon speaks nip44 only. A leftover \`transport = "gift-wrap"\` refuses to start — this package keeps pinning nip44
- Makers can cancel before paying the bond; **Configure Anti-Abuse Bond** now includes the maker-bond payment timeout (default 900s)
- Disputes close as cooperatively-canceled on a cooperative cancel, and as released when the seller releases
- Restore returns the counterparty's trade pubkey

**Fixes**
- Trade keys recognized when create/take is accepted; taker-bond invoices expire with their window; maker bond payment has a deadline; amt/fa tags stay consistent during the taker-bond window
- Price staleness for relayed rates is bounded at one TTL; publish resolves on the first relay OK; solvers are notified when a dispute closes after user resolution

**StartOS**
- Image pin \`mostrop2p/mostro:v0.19.0\` (amd64 + arm64)
- \`maker_bond_payment_timeout_seconds\` is filled on upgrade and exposed under Anti-Abuse Bond
- Cashu escrow is not packaged; this service still requires LND

Full notes: https://github.com/MostroP2P/mostro/releases/tag/v0.19.0`,
    es_ES: `Mostro actualizado a 0.19.0.

**Novedades**
- El protocolo v1 (gift-wrap) se elimina; el daemon solo habla nip44. Un \`transport = "gift-wrap"\` residual impide el arranque — este paquete sigue fijando nip44
- Los makers pueden cancelar antes de pagar la fianza; **Configurar fianza antiabuso** incluye el tiempo de pago de la fianza del maker (900s por defecto)
- Las disputas se cierran como cancelación cooperativa en una cancelación cooperativa, y como liberadas cuando el vendedor libera
- Restore devuelve la clave de trade de la contraparte

**Correcciones**
- Se reconocen las claves de trade al aceptar create/take; las facturas de fianza del taker expiran con su ventana; el maker tiene plazo para pagar la fianza; las etiquetas amt/fa se mantienen durante la ventana de fianza del taker
- La caducidad de precios retransmitidos se limita a un TTL; publish resuelve con el primer OK del relay; se notifica al solver cuando una disputa cierra tras resolución del usuario

**StartOS**
- Imagen \`mostrop2p/mostro:v0.19.0\` (amd64 + arm64)
- \`maker_bond_payment_timeout_seconds\` se rellena al actualizar y está en Fianza antiabuso
- El escrow Cashu no está empaquetado; este servicio sigue requiriendo LND

Notas completas: https://github.com/MostroP2P/mostro/releases/tag/v0.19.0`,
    de_DE: `Mostro auf 0.19.0 aktualisiert.

**Funktionen**
- Protokoll v1 (gift-wrap) ist entfernt; der Daemon spricht nur nip44. Ein übrig gebliebenes \`transport = "gift-wrap"\` verhindert den Start — dieses Paket pinnt weiterhin nip44
- Maker können vor der Bond-Zahlung stornieren; **Anti-Abuse-Bond konfigurieren** enthält jetzt das Maker-Bond-Zahlungs-Timeout (Standard 900s)
- Disputes schließen als kooperativ storniert bei kooperativer Stornierung und als freigegeben, wenn der Verkäufer freigibt
- Restore liefert den Trade-Pubkey der Gegenpartei

**Korrekturen**
- Trade-Keys werden bei akzeptiertem create/take erkannt; Taker-Bond-Rechnungen laufen mit ihrem Fenster ab; Maker haben eine Frist für die Bond-Zahlung; amt/fa-Tags bleiben im Taker-Bond-Fenster konsistent
- Preis-Staleness für weitergeleitete Kurse ist auf ein TTL begrenzt; Publish löst beim ersten Relay-OK auf; Solver werden benachrichtigt, wenn ein Dispute nach Nutzerlösung schließt

**StartOS**
- Image-Pin \`mostrop2p/mostro:v0.19.0\` (amd64 + arm64)
- \`maker_bond_payment_timeout_seconds\` wird beim Upgrade gesetzt und unter Anti-Abuse-Bond angeboten
- Cashu-Escrow ist nicht paketiert; dieser Dienst benötigt weiterhin LND

Vollständige Hinweise: https://github.com/MostroP2P/mostro/releases/tag/v0.19.0`,
    pl_PL: `Zaktualizowano Mostro do 0.19.0.

**Funkcje**
- Protokół v1 (gift-wrap) został usunięty; demon mówi tylko nip44. Pozostałe \`transport = "gift-wrap"\` blokuje start — ten pakiet nadal pinuje nip44
- Makerzy mogą anulować przed opłaceniem kaucji; **Konfiguruj kaucję antynadużyciową** zawiera teraz timeout płatności kaucji maker (domyślnie 900s)
- Spory zamykane są jako kooperacyjnie anulowane przy kooperacyjnym anulowaniu oraz jako released, gdy sprzedawca zwalnia
- Restore zwraca trade pubkey kontrahenta

**Poprawki**
- Klucze trade rozpoznawane przy zaakceptowanym create/take; faktury kaucji takera wygasają z oknem; maker ma termin na płatność kaucji; tagi amt/fa pozostają spójne w oknie kaucji takera
- Staleness cen przekazywanych ograniczony do jednego TTL; publish kończy się na pierwszym OK relay; solverzy są powiadamiani, gdy spór zamyka się po rozwiązaniu użytkownika

**StartOS**
- Pin obrazu \`mostrop2p/mostro:v0.19.0\` (amd64 + arm64)
- \`maker_bond_payment_timeout_seconds\` uzupełniane przy upgrade i dostępne w Anti-Abuse Bond
- Escrow Cashu nie jest spakowany; ta usługa nadal wymaga LND

Pełne uwagi: https://github.com/MostroP2P/mostro/releases/tag/v0.19.0`,
    fr_FR: `Mostro mis à jour vers 0.19.0.

**Fonctionnalités**
- Le protocole v1 (gift-wrap) est retiré ; le démon ne parle que nip44. Un \`transport = "gift-wrap"\` résiduel refuse de démarrer — ce paquet continue de figer nip44
- Les makers peuvent annuler avant de payer la caution ; **Configurer la caution anti-abus** inclut le délai de paiement de la caution maker (900s par défaut)
- Les litiges se ferment en annulation coopérative lors d’une annulation coopérative, et en released lorsque le vendeur libère
- Restore renvoie la clé de trade de la contrepartie

**Corrections**
- Clés de trade reconnues à l’acceptation de create/take ; factures de caution taker expirant avec leur fenêtre ; délai pour le paiement de la caution maker ; tags amt/fa cohérents pendant la fenêtre de caution taker
- La fraîcheur des prix relayés est bornée à un TTL ; publish se résout au premier OK de relais ; les solvers sont notifiés quand un litige se ferme après résolution utilisateur

**StartOS**
- Image \`mostrop2p/mostro:v0.19.0\` (amd64 + arm64)
- \`maker_bond_payment_timeout_seconds\` est renseigné à la mise à jour et exposé sous Caution anti-abus
- L’escrow Cashu n’est pas empaqueté ; ce service exige toujours LND

Notes complètes : https://github.com/MostroP2P/mostro/releases/tag/v0.19.0`,
  },
  migrations: {
    up: async ({ effects }) => {
      // Fill new 0.19.0 keys (maker_bond_payment_timeout_seconds) from
      // .catch() defaults. Invalid leftover transport = gift-wrap is
      // repaired to nip44 so mostrod can start.
      await daemon_settings.merge(effects, {})
    },
    down: IMPOSSIBLE,
  },
})
